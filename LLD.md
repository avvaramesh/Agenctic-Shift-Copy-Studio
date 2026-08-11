# LOW-LEVEL DESIGN (LLD) DOCUMENT: SHIFT COPY STUDIO

## 1. Class & Module Specifications

### 1.1 Streaming Transfer Pipeline (`/src/lib/transferEngine.ts`)

```typescript
export interface TransferChunkConfig {
  chunkSize: number; // Default 8MB (8 * 1024 * 1024 bytes)
  parallelWorkers: number; // Default 4 worker threads
  verifyChecksum: boolean; // Default true (SHA-256 / MD5)
}

export interface TransferStreamJob {
  jobId: string;
  sourceFileId: string;
  sourceDrive: 'google_drive' | 'onedrive' | 'local';
  targetPath: string;
  targetDrive: 'google_drive' | 'onedrive' | 'local';
  bytesTotal: number;
  bytesTransferred: number;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'failed';
  sha256Hash: string;
}

export class StreamingTransferEngine {
  async initChunkedUpload(job: TransferStreamJob, config: TransferChunkConfig): Promise<string>;
  async streamChunk(uploadUrl: string, chunkBuffer: ArrayBuffer, offset: number): Promise<boolean>;
  async finalizeTransfer(jobId: string): Promise<{ success: boolean; hashVerified: boolean }>;
}
```

---

### 1.2 Deduplication & Hash Comparison Engine (`/src/components/DeduplicationMatrix.tsx`)

```typescript
export interface FileFingerprint {
  id: string;
  fileName: string;
  drive: 'Google Drive' | 'OneDrive';
  sizeBytes: number;
  md5Checksum?: string; // Google Drive
  sha1Hash?: string; // OneDrive
  quickXorHash?: string; // OneDrive
  pHash?: string; // 64-bit Hex Perceptual Hash for media
  resolution?: string; // e.g. "3840x2160"
}

export function calculatePerceptualDistance(pHashA: string, pHashB: string): number {
  // Calculates Hamming Distance between two 64-bit hexadecimal perceptual hashes
  let distance = 0;
  const valA = BigInt("0x" + pHashA);
  const valB = BigInt("0x" + pHashB);
  let xorVal = valA ^ valB;
  
  while (xorVal > 0n) {
    if (xorVal & 1n) distance++;
    xorVal >>= 1n;
  }
  return distance; // Distance <= 5 indicates 99.8% visual match
}
```

---

### 1.3 Gemini Vector Embedding Service (`/src/components/SmartProjectClustering.tsx`)

```typescript
import { GoogleGenAI } from "@google/genai";

export async function generateFileEmbedding(
  fileName: string, 
  pathAncestry: string, 
  mimeType: string
): Promise<number[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: `File: ${fileName} | Path: ${pathAncestry} | Type: ${mimeType}`,
  });
  return response.embedding.values; // 768-dimensional float vector
}
```

---

### 1.4 Agentic Tool Calls & ReAct Loop (`/src/components/AgenticOrchestrator.tsx`)

```typescript
export interface AgentToolCall {
  toolName: 'search_files_semantic' | 'stream_file_transfer' | 'quarantine_duplicates' | 'convert_file_format';
  arguments: Record<string, any>;
}

export interface AgentStepPlan {
  id: string;
  actionType: 'create_folder' | 'transfer_file' | 'quarantine_file' | 'delete_duplicate';
  title: string;
  sourcePath?: string;
  targetPath?: string;
  sizeBytes?: number;
  approved: boolean;
  isDestructive: boolean;
}
```

---

---

## 2. Server API Endpoint Specification (`/server.ts`)

### 2.1 Directory Exploration & Metadata

#### `GET /api/drive/folders`
- **Description**: Fetches subfolders and files for a specified Google Drive folder or root.
- **Query Parameters**:
  - `folderId`: string (default `'root'`)
  - `accessToken`: string (Google OAuth Bearer token)
- **Response**: `200 OK`
```json
{
  "folders": [
    {
      "id": "1A2B3C...",
      "name": "Documents",
      "mimeType": "application/vnd.google-apps.folder",
      "itemCount": 42
    }
  ],
  "files": [
    {
      "id": "4D5E6F...",
      "name": "Report.pdf",
      "size": 1048576,
      "mimeType": "application/pdf",
      "modifiedTime": "2026-08-10T12:00:00Z"
    }
  ],
  "breadcrumbs": [
    { "id": "root", "name": "My Drive" },
    { "id": "1A2B3C...", "name": "Documents" }
  ]
}
```

#### `POST /api/drive/inspect`
- **Description**: Validates a Google Drive share link or folder ID and inspects total contained files and size.
- **Request Body**:
```json
{
  "folderUrlOrId": "https://drive.google.com/drive/folders/1A2B3C...",
  "accessToken": "ya29.a0..."
}
```
- **Response**: `200 OK`
```json
{
  "valid": true,
  "folderId": "1A2B3C...",
  "folderName": "Shared Research Data",
  "itemCount": 128,
  "totalSizeBytes": 42949672960
}
```

#### `POST /api/drive/create-folder`
- **Description**: Creates a new destination folder in Google Drive.
- **Request Body**:
```json
{
  "folderName": "Migrated_Backup_2026",
  "parentFolderId": "root",
  "accessToken": "ya29.a0..."
}
```
- **Response**: `200 OK`
```json
{
  "folderId": "9Z8Y7X...",
  "folderName": "Migrated_Backup_2026"
}
```

---

### 2.2 Async Transfer Engine Endpoints

#### `POST /api/drive/start-copy`
- **Description**: Initiates a background asynchronous drive-to-drive migration job.
- **Request Body**:
```json
{
  "sourceFolderId": "1A2B3C...",
  "targetFolderId": "9Z8Y7X...",
  "config": {
    "copyMode": "deep_clone",
    "conflictStrategy": "rename",
    "preserveTimestamps": true,
    "skipDuplicates": true,
    "parallelWorkers": 8
  },
  "sourceToken": "ya29.a0SourceToken...",
  "targetToken": "ya29.a0TargetToken..."
}
```
- **Response**: `200 OK`
```json
{
  "jobId": "job_1751029881",
  "status": "in_progress",
  "totalFiles": 128,
  "totalBytes": 42949672960
}
```

#### `GET /api/drive/job-status/:jobId`
- **Description**: Queries real-time progress, files completed, speed (MB/s), and active logs for a transfer job.
- **Response**: `200 OK`
```json
{
  "jobId": "job_1751029881",
  "status": "in_progress",
  "progress": {
    "filesCopied": 48,
    "totalFiles": 128,
    "bytesTransferred": 16106127360,
    "totalBytes": 42949672960,
    "currentSpeedMBs": 28.5,
    "estimatedSecondsRemaining": 94
  },
  "logs": [
    "[12:04:12] Copied: /Research/Paper1.pdf (12.4 MB)",
    "[12:04:13] Copied: /Research/Dataset.csv (140.2 MB)"
  ]
}
```

#### `POST /api/drive/job-action/:jobId`
- **Description**: Sends operational control commands (`pause`, `resume`, `cancel`) to a running transfer job.
- **Request Body**:
```json
{
  "action": "pause"
}
```
- **Response**: `200 OK`
```json
{
  "jobId": "job_1751029881",
  "status": "paused",
  "message": "Transfer job job_1751029881 successfully paused."
}
```

#### `POST /api/auth/refresh`
- **Description**: Refreshes expired OAuth 2.0 access tokens using stored refresh tokens.
- **Response**: `200 OK`
```json
{
  "accessToken": "ya29.a0NewRefreshedToken...",
  "expiresInSeconds": 3600
}
```

