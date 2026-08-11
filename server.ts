import express from "express";
import path from "path";
import { google } from "googleapis";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

interface CopyJobLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

interface CopyJob {
  id: string;
  sourceFolderId: string;
  sourceFolderName: string;
  sourceLocation?: string;
  targetFolderId: string;
  targetFolderName: string;
  targetLocation?: string;
  createdTargetFolderId?: string;
  createdTargetFolderUrl?: string;
  status: "idle" | "in_progress" | "paused" | "completed" | "failed" | "cancelled";
  progressPercentage: number;
  filesTotal: number;
  filesCopied: number;
  filesFailed: number;
  currentFile?: string;
  speedFilesPerSec: number;
  startTime?: number;
  endTime?: number;
  options: {
    folderNameStrategy: string; // 'same' | 'copy_suffix' | 'custom'
    customFolderName?: string;
    includeSubfolders: boolean;
    filterExtensions?: string[];
    duplicateHandling: "overwrite" | "skip" | "rename";
  };
  logs: CopyJobLog[];
  sourceAccessToken?: string;
  sourceRefreshToken?: string;
  sourceTokenExpiry?: number;
  sourceProvider?: string;
  targetAccessToken?: string;
  targetRefreshToken?: string;
  targetTokenExpiry?: number;
  targetProvider?: string;
}

// In-memory store for copy jobs
const activeJobs: Record<string, CopyJob> = {};

function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth });
}

// OAuth Refresh Token helper for background long-running transfers
async function refreshOAuthAccessToken(params: {
  refreshToken: string;
  provider?: string;
}): Promise<{ accessToken: string; expiresIn: number } | null> {
  const provider = params.provider || "google";
  if (provider === "google") {
    try {
      // Use Google OAuth token refresh endpoint
      const paramsBody = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: params.refreshToken,
      });

      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: paramsBody,
      });

      if (res.ok) {
        const data = await res.json();
        return {
          accessToken: data.access_token,
          expiresIn: data.expires_in || 3600,
        };
      } else {
        const errorText = await res.text();
        console.warn("Google OAuth token refresh endpoint returned non-ok status:", errorText);
      }
    } catch (err) {
      console.error("Failed to refresh Google OAuth access token:", err);
    }
  } else if (provider === "microsoft") {
    try {
      const res = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.MS_CLIENT_ID || "",
          client_secret: process.env.MS_CLIENT_SECRET || "",
          grant_type: "refresh_token",
          refresh_token: params.refreshToken,
          scope: "offline_access Files.ReadWrite.All User.Read",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          accessToken: data.access_token,
          expiresIn: data.expires_in || 3600,
        };
      }
    } catch (err) {
      console.error("Failed to refresh Microsoft OAuth access token:", err);
    }
  }
  return null;
}

// Helper to extract Folder ID from Google Drive URL or raw string
function extractFolderId(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes("drive.google.com")) {
    const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
    const idParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParam && idParam[1]) {
      return idParam[1];
    }
  }
  return trimmed;
}

// Helper to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GET /api/drive/folders - List contents of a Drive folder
app.get("/api/drive/folders", async (req, res) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!accessToken) {
    return res.status(401).json({ error: "Missing or invalid Google OAuth access token" });
  }

  const parentId = (req.query.folderId as string) || "root";

  try {
    const drive = getDriveClient(accessToken);

    // Get current parent folder info if not root
    let currentFolderName = "My Drive";
    let q = `'${parentId}' in parents and trashed = false`;

    if (parentId === "shared") {
      q = "sharedWithMe = true and trashed = false";
      currentFolderName = "Shared With Me";
    } else if (parentId === "starred") {
      q = "starred = true and trashed = false";
      currentFolderName = "Starred";
    } else if (parentId !== "root") {
      try {
        const folderRes = await drive.files.get({
          fileId: parentId,
          fields: "id, name",
          supportsAllDrives: true,
        });
        currentFolderName = folderRes.data.name || "Folder";
      } catch (err) {
        console.warn("Could not fetch folder name:", err);
      }
    }

    // List items inside parentId
    const response = await drive.files.list({
      q,
      fields: "files(id, name, mimeType, size, modifiedTime, thumbnailLink, webViewLink, iconLink)",
      pageSize: 200,
      orderBy: "folder,name",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = response.data.files || [];

    const formattedItems = files.map((file) => {
      const isFolder = file.mimeType === "application/vnd.google-apps.folder";
      return {
        id: file.id,
        name: file.name,
        isFolder,
        mimeType: file.mimeType,
        size: file.size ? parseInt(file.size, 10) : 0,
        formattedSize: file.size ? formatBytes(parseInt(file.size, 10)) : "-",
        modifiedTime: file.modifiedTime,
        thumbnailLink: file.thumbnailLink,
        webViewLink: file.webViewLink,
        iconLink: file.iconLink,
      };
    });

    res.json({
      currentFolder: {
        id: parentId,
        name: currentFolderName,
      },
      items: formattedItems,
    });
  } catch (error: any) {
    console.error("Drive API list error:", error);
    res.status(500).json({
      error: error.message || "Failed to list Google Drive contents",
      details: error.errors || error.response?.data,
    });
  }
});

// POST /api/drive/inspect - Inspect a Drive URL or ID
app.post("/api/drive/inspect", async (req, res) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const { folderUrlOrId } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Missing Google OAuth access token" });
  }

  if (!folderUrlOrId) {
    return res.status(400).json({ error: "Folder URL or ID is required" });
  }

  const folderId = extractFolderId(folderUrlOrId);

  try {
    const drive = getDriveClient(accessToken);
    const folderRes = await drive.files.get({
      fileId: folderId,
      fields: "id, name, mimeType, webViewLink",
    });

    if (folderRes.data.mimeType !== "application/vnd.google-apps.folder") {
      return res.status(400).json({ error: "The provided ID belongs to a file, not a folder." });
    }

    // Count direct items inside
    const listRes = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, mimeType)",
      pageSize: 1000,
    });

    const items = listRes.data.files || [];
    const folderCount = items.filter((f) => f.mimeType === "application/vnd.google-apps.folder").length;
    const fileCount = items.length - folderCount;

    res.json({
      id: folderRes.data.id,
      name: folderRes.data.name,
      webViewLink: folderRes.data.webViewLink,
      directFolders: folderCount,
      directFiles: fileCount,
      totalDirectItems: items.length,
    });
  } catch (error: any) {
    console.error("Drive inspect error:", error);
    res.status(500).json({ error: error.message || "Invalid folder ID or access denied" });
  }
});

// POST /api/drive/create-folder
app.post("/api/drive/create-folder", async (req, res) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const { name, parentId } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Missing Google OAuth access token" });
  }

  if (!name) {
    return res.status(400).json({ error: "Folder name is required" });
  }

  try {
    const drive = getDriveClient(accessToken);
    const fileMetadata = {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : ["root"],
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id, name, webViewLink",
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Create folder error:", error);
    res.status(500).json({ error: error.message || "Failed to create folder" });
  }
});

// POST /api/auth/refresh - Refresh OAuth access tokens using background refresh token
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken, provider } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: "Missing refreshToken parameter" });
  }

  try {
    const renewed = await refreshOAuthAccessToken({ refreshToken, provider: provider || "google" });
    if (renewed) {
      return res.json({
        accessToken: renewed.accessToken,
        expiresIn: renewed.expiresIn,
        tokenExpiry: Date.now() + renewed.expiresIn * 1000,
      });
    } else {
      return res.status(400).json({ error: "Failed to refresh token with provided OAuth refresh token" });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "OAuth token refresh failed" });
  }
});

// POST /api/drive/start-copy - Asynchronous recursive copy job
app.post("/api/drive/start-copy", async (req, res) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  const {
    sourceFolderId,
    targetFolderId,
    targetAccessToken,
    options,
    sourceRefreshToken,
    sourceTokenExpiry,
    sourceProvider,
    targetRefreshToken,
    targetTokenExpiry,
    targetProvider,
  } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: "Missing Google OAuth access token" });
  }

  if (!sourceFolderId || !targetFolderId) {
    return res.status(400).json({ error: "Source folder ID and Target folder ID are required" });
  }

  const jobId = "job_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

  const job: CopyJob = {
    id: jobId,
    sourceFolderId,
    sourceFolderName: "Source Folder",
    sourceLocation: "google_drive",
    targetFolderId,
    targetFolderName: "Target Folder",
    targetLocation: "google_drive",
    status: "in_progress",
    progressPercentage: 0,
    filesTotal: 0,
    filesCopied: 0,
    filesFailed: 0,
    speedFilesPerSec: 0,
    startTime: Date.now(),
    options: options || {
      folderNameStrategy: "same",
      includeSubfolders: true,
      duplicateHandling: "rename",
    },
    logs: [],
    sourceAccessToken: accessToken,
    sourceRefreshToken,
    sourceTokenExpiry: sourceTokenExpiry || Date.now() + 3600 * 1000,
    sourceProvider: sourceProvider || "google",
    targetAccessToken: targetAccessToken || accessToken,
    targetRefreshToken: targetRefreshToken || sourceRefreshToken,
    targetTokenExpiry: targetTokenExpiry || sourceTokenExpiry || Date.now() + 3600 * 1000,
    targetProvider: targetProvider || "google",
  };

  activeJobs[jobId] = job;

  // Start background copying execution
  runCopyJob(jobId, accessToken, targetAccessToken || accessToken).catch((err) => {
    console.error(`Job ${jobId} failed with exception:`, err);
    if (activeJobs[jobId]) {
      activeJobs[jobId].status = "failed";
      addJobLog(jobId, "error", `Fatal job error: ${err.message || err}`);
    }
  });

  res.json({ jobId, status: "started" });
});

// GET /api/drive/job-status/:jobId
app.get("/api/drive/job-status/:jobId", (req, res) => {
  const job = activeJobs[req.params.jobId];
  if (!job) {
    return res.status(404).json({ error: "Copy job not found" });
  }
  res.json(job);
});

// POST /api/drive/job-action/:jobId
app.post("/api/drive/job-action/:jobId", (req, res) => {
  const { action } = req.body; // 'pause' | 'resume' | 'cancel'
  const job = activeJobs[req.params.jobId];

  if (!job) {
    return res.status(404).json({ error: "Copy job not found" });
  }

  if (action === "cancel") {
    job.status = "cancelled";
    job.endTime = Date.now();
    addJobLog(job.id, "warning", "Copy process cancelled by user.");
  } else if (action === "pause") {
    job.status = "paused";
    addJobLog(job.id, "info", "Copy process paused.");
  } else if (action === "resume") {
    job.status = "in_progress";
    addJobLog(job.id, "info", "Copy process resumed.");
  }

  res.json({ status: job.status });
});

function addJobLog(jobId: string, type: CopyJobLog["type"], message: string) {
  const job = activeJobs[jobId];
  if (!job) return;
  const log: CopyJobLog = {
    id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
    timestamp: new Date().toLocaleTimeString(),
    type,
    message,
  };
  job.logs.unshift(log);
  if (job.logs.length > 200) {
    job.logs.pop();
  }
}

// Exponential backoff helper for resilient API requests
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 5, initialDelayMs = 1000): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const status = err?.status || err?.response?.status;
      const isRateLimit = status === 429 || status === 500 || status === 502 || status === 503;

      if (attempt > maxRetries || !isRateLimit) {
        throw err;
      }

      const backoffDelay = initialDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500;
      console.warn(`Drive API rate limited (status ${status}). Retrying attempt ${attempt}/${maxRetries} after ${Math.round(backoffDelay)}ms...`);
      await new Promise((r) => setTimeout(r, backoffDelay));
    }
  }
}

// Auto-refresh tokens helper before API calls or on expiration
async function ensureActiveTokens(
  jobId: string,
  clients: { sourceDrive: any; targetDrive: any },
  forceRefresh = false
): Promise<{ sourceDrive: any; targetDrive: any }> {
  const job = activeJobs[jobId];
  if (!job) return clients;

  const NOW = Date.now();
  const BUFFER_MS = 300 * 1000; // 5 minute buffer before 60-min expiry

  const updated = { ...clients };

  // Source token refresh
  if (
    job.sourceRefreshToken &&
    (forceRefresh || (job.sourceTokenExpiry && NOW >= job.sourceTokenExpiry - BUFFER_MS))
  ) {
    addJobLog(
      jobId,
      "info",
      "Source OAuth Access Token near 60-min expiration threshold. Auto-refreshing in background..."
    );
    const renewed = await refreshOAuthAccessToken({
      refreshToken: job.sourceRefreshToken,
      provider: job.sourceProvider || "google",
    });
    if (renewed?.accessToken) {
      job.sourceAccessToken = renewed.accessToken;
      job.sourceTokenExpiry = NOW + renewed.expiresIn * 1000;
      updated.sourceDrive = getDriveClient(renewed.accessToken);
      addJobLog(
        jobId,
        "success",
        `Source access token successfully auto-refreshed! Token valid for next ${Math.round(
          renewed.expiresIn / 60
        )} minutes.`
      );
    }
  }

  // Target token refresh
  if (
    job.targetRefreshToken &&
    (forceRefresh || (job.targetTokenExpiry && NOW >= job.targetTokenExpiry - BUFFER_MS))
  ) {
    addJobLog(
      jobId,
      "info",
      "Target OAuth Access Token near 60-min expiration threshold. Auto-refreshing in background..."
    );
    const renewed = await refreshOAuthAccessToken({
      refreshToken: job.targetRefreshToken,
      provider: job.targetProvider || "google",
    });
    if (renewed?.accessToken) {
      job.targetAccessToken = renewed.accessToken;
      job.targetTokenExpiry = NOW + renewed.expiresIn * 1000;
      updated.targetDrive = getDriveClient(renewed.accessToken);
      addJobLog(
        jobId,
        "success",
        `Target access token successfully auto-refreshed! Token valid for next ${Math.round(
          renewed.expiresIn / 60
        )} minutes.`
      );
    }
  }

  return updated;
}

// Background worker for recursively copying Google Drive folder structures
async function runCopyJob(jobId: string, sourceAccessToken: string, targetAccessToken?: string) {
  const job = activeJobs[jobId];
  if (!job) return;

  const effectiveTargetToken = targetAccessToken || sourceAccessToken;
  let clients = {
    sourceDrive: getDriveClient(job.sourceAccessToken || sourceAccessToken),
    targetDrive: getDriveClient(job.targetAccessToken || effectiveTargetToken),
  };

  try {
    // Proactively check and refresh tokens if expiring soon
    clients = await ensureActiveTokens(jobId, clients);

    // 1. Fetch Source Folder Meta
    addJobLog(jobId, "info", "Fetching source folder metadata...");
    if (job.sourceFolderId === "shared") {
      job.sourceFolderName = "Shared With Me";
    } else if (job.sourceFolderId === "starred") {
      job.sourceFolderName = "Starred";
    } else if (job.sourceFolderId === "root") {
      job.sourceFolderName = "My Drive";
    } else {
      try {
        const sourceRes = await retryWithBackoff(() =>
          clients.sourceDrive.files.get({
            fileId: job.sourceFolderId,
            fields: "id, name",
            supportsAllDrives: true,
          })
        );
        job.sourceFolderName = sourceRes.data.name || "Source Folder";
      } catch (err) {
        console.warn("Could not fetch source folder meta:", err);
        job.sourceFolderName = "Source Folder";
      }
    }

    // Fetch Target Folder Meta
    let actualTargetParentId = job.targetFolderId;
    if (job.targetFolderId === "shared" || job.targetFolderId === "starred") {
      job.targetFolderName = job.targetFolderId === "shared" ? "Shared With Me" : "Starred";
      actualTargetParentId = "root";
      addJobLog(
        jobId,
        "info",
        `Target was virtual scope (${job.targetFolderName}). Creating destination folder in My Drive root.`
      );
    } else if (job.targetFolderId === "root") {
      job.targetFolderName = "My Drive";
      actualTargetParentId = "root";
    } else {
      try {
        const targetRes = await retryWithBackoff(() =>
          clients.targetDrive.files.get({
            fileId: job.targetFolderId,
            fields: "id, name, webViewLink",
            supportsAllDrives: true,
          })
        );
        job.targetFolderName = targetRes.data.name || "Target Folder";
      } catch (err) {
        console.warn("Could not fetch target folder meta:", err);
        job.targetFolderName = "Target Folder";
      }
    }

    addJobLog(jobId, "info", `Source: "${job.sourceFolderName}", Target: "${job.targetFolderName}"`);

    // 2. Determine target destination folder name
    let destFolderName = job.sourceFolderName;
    if (job.options.folderNameStrategy === "copy_suffix") {
      destFolderName = `${job.sourceFolderName} (Copy)`;
    } else if (job.options.folderNameStrategy === "custom" && job.options.customFolderName) {
      destFolderName = job.options.customFolderName;
    }

    addJobLog(jobId, "info", `Creating destination folder "${destFolderName}" inside target...`);

    const rootFolderCreateRes = await retryWithBackoff(() =>
      clients.targetDrive.files.create({
        requestBody: {
          name: destFolderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [actualTargetParentId],
        },
        fields: "id, name, webViewLink",
        supportsAllDrives: true,
      })
    );

    const rootDestFolderId = rootFolderCreateRes.data.id!;
    job.createdTargetFolderId = rootDestFolderId;
    job.createdTargetFolderUrl = rootFolderCreateRes.data.webViewLink || undefined;

    addJobLog(jobId, "success", `Created folder "${destFolderName}" on Google Drive.`);

    // 3. Collect items to copy
    addJobLog(jobId, "info", "Scanning source hierarchy for selected files...");

    interface DriveTreeItem {
      id: string;
      name: string;
      mimeType: string;
      sourceParentId: string;
      targetParentId: string;
    }

    const allFilesToCopy: DriveTreeItem[] = [];
    const folderMapping: Record<string, string> = {};
    folderMapping[job.sourceFolderId] = rootDestFolderId;

    async function scanFolder(srcFolderId: string, destFolderId: string, specificItemIds?: string[]) {
      if (job.status === "cancelled") return;

      clients = await ensureActiveTokens(jobId, clients);

      let query = `'${srcFolderId}' in parents and trashed = false`;
      if (srcFolderId === "shared") {
        query = "sharedWithMe = true and trashed = false";
      } else if (srcFolderId === "starred") {
        query = "starred = true and trashed = false";
      }

      let pageToken: string | undefined = undefined;
      do {
        const listRes: any = await retryWithBackoff(() =>
          clients.sourceDrive.files.list({
            q: query,
            fields: "nextPageToken, files(id, name, mimeType)",
            pageSize: 100,
            pageToken,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
          })
        );

        const items = listRes.data.files || [];
        for (const item of items) {
          // If specific items were chosen, filter at the root scan level
          if (specificItemIds && specificItemIds.length > 0 && !specificItemIds.includes(item.id)) {
            continue;
          }

          if (item.mimeType === "application/vnd.google-apps.folder") {
            if (job.options.includeSubfolders) {
              // Create subfolder in target
              const newSub = await retryWithBackoff(() =>
                clients.targetDrive.files.create({
                  requestBody: {
                    name: item.name,
                    mimeType: "application/vnd.google-apps.folder",
                    parents: [destFolderId],
                  },
                  fields: "id",
                  supportsAllDrives: true,
                })
              );
              const newSubId = newSub.data.id!;
              folderMapping[item.id] = newSubId;
              addJobLog(jobId, "info", `Subfolder created: "${item.name}"`);
              // Recursively scan subfolder
              await scanFolder(item.id, newSubId);
            }
          } else {
            // Apply extension filter if configured
            if (job.options.filterExtensions && job.options.filterExtensions.length > 0) {
              const ext = item.name.split(".").pop()?.toLowerCase();
              const allowed = job.options.filterExtensions.some((e) =>
                e.toLowerCase().replace(".", "") === ext
              );
              if (!allowed) continue;
            }

            allFilesToCopy.push({
              id: item.id,
              name: item.name,
              mimeType: item.mimeType,
              sourceParentId: srcFolderId,
              targetParentId: destFolderId,
            });
          }
        }
        pageToken = listRes.data.nextPageToken;
      } while (pageToken && (job.status as string) !== "cancelled");
    }

    const filterIds = (job.options as any).selectedItemIds;
    if (filterIds && filterIds.length > 0) {
      addJobLog(jobId, "info", `Selective copy mode active: copying ${filterIds.length} selected items.`);
    }

    await scanFolder(job.sourceFolderId, rootDestFolderId, filterIds);

    job.filesTotal = allFilesToCopy.length;
    addJobLog(jobId, "info", `Scan complete. Total files queued for copy: ${job.filesTotal}`);

    if (job.filesTotal === 0) {
      job.status = "completed";
      job.progressPercentage = 100;
      job.endTime = Date.now();
      addJobLog(jobId, "success", "Folder copy completed! (Folder was empty or contained no matching files)");
      return;
    }

    // 4. Perform File Copies with token refresh & rate limiting resiliency
    const isCrossAccount =
      (job.sourceAccessToken || sourceAccessToken) !== (job.targetAccessToken || effectiveTargetToken);
    if (isCrossAccount) {
      addJobLog(jobId, "info", "Cross-Account transfer mode: Stream-copying files between distinct accounts...");
    }

    for (let i = 0; i < allFilesToCopy.length; i++) {
      while (job.status === "paused") {
        await new Promise((r) => setTimeout(r, 1000));
      }

      if (job.status === "cancelled") {
        addJobLog(jobId, "warning", "Copy process stopped on user cancellation.");
        return;
      }

      // Check and refresh tokens if close to expiration
      clients = await ensureActiveTokens(jobId, clients);

      const fileItem = allFilesToCopy[i];
      job.currentFile = fileItem.name;

      try {
        if (!isCrossAccount) {
          // Same account: Fast native Google Drive server-side copy
          await retryWithBackoff(() =>
            clients.targetDrive.files.copy({
              fileId: fileItem.id,
              requestBody: {
                name: fileItem.name,
                parents: [fileItem.targetParentId],
              },
              supportsAllDrives: true,
            })
          );
        } else {
          // Cross-account stream transfer fallback
          try {
            await retryWithBackoff(() =>
              clients.targetDrive.files.copy({
                fileId: fileItem.id,
                requestBody: {
                  name: fileItem.name,
                  parents: [fileItem.targetParentId],
                },
                supportsAllDrives: true,
              })
            );
          } catch {
            // Direct copy failed due to permissions: Download from source & upload stream to target
            const getRes = await retryWithBackoff(() =>
              clients.sourceDrive.files.get(
                { fileId: fileItem.id, alt: "media", supportsAllDrives: true },
                { responseType: "stream" }
              )
            );

            await retryWithBackoff(() =>
              clients.targetDrive.files.create({
                requestBody: {
                  name: fileItem.name,
                  parents: [fileItem.targetParentId],
                },
                media: {
                  mimeType: fileItem.mimeType,
                  body: getRes.data,
                },
                supportsAllDrives: true,
              })
            );
          }
        }

        job.filesCopied++;
        job.progressPercentage = Math.round((job.filesCopied / job.filesTotal) * 100);

        const elapsedSec = (Date.now() - (job.startTime || Date.now())) / 1000;
        if (elapsedSec > 0) {
          job.speedFilesPerSec = parseFloat((job.filesCopied / elapsedSec).toFixed(1));
        }

        if (i % 3 === 0 || i === allFilesToCopy.length - 1) {
          addJobLog(jobId, "success", `Copied (${job.filesCopied}/${job.filesTotal}): ${fileItem.name}`);
        }
      } catch (fileErr: any) {
        // If 401 Unauthorized occurs, try forced token refresh and single retry
        if (fileErr?.status === 401 || fileErr?.response?.status === 401) {
          addJobLog(jobId, "warning", `401 Unauthorized encountered for "${fileItem.name}". Force-refreshing OAuth access tokens...`);
          clients = await ensureActiveTokens(jobId, clients, true);
          try {
            // Retry copy with fresh credentials
            await retryWithBackoff(() =>
              clients.targetDrive.files.copy({
                fileId: fileItem.id,
                requestBody: {
                  name: fileItem.name,
                  parents: [fileItem.targetParentId],
                },
                supportsAllDrives: true,
              })
            );
            job.filesCopied++;
            job.progressPercentage = Math.round((job.filesCopied / job.filesTotal) * 100);
            addJobLog(jobId, "success", `Copied after token auto-refresh (${job.filesCopied}/${job.filesTotal}): ${fileItem.name}`);
            continue;
          } catch (retryErr) {
            // Retry failed
          }
        }
        job.filesFailed++;
        addJobLog(jobId, "error", `Failed to copy "${fileItem.name}": ${fileErr.message || fileErr}`);
      }
    }

    job.status = "completed";
    job.progressPercentage = 100;
    job.endTime = Date.now();
    job.currentFile = undefined;
    addJobLog(jobId, "success", `Folder copy successfully completed! ${job.filesCopied} files copied silently in background.`);
  } catch (error: any) {
    job.status = "failed";
    job.endTime = Date.now();
    addJobLog(jobId, "error", `Job execution error: ${error.message || error}`);
  }
}

// Start Server & Express Vite Middleware Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
