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

## 2. API Endpoint Specification

### `POST /api/transfer/start`
- **Description**: Initiates a background stream transfer between cloud storage endpoints.
- **Request Body**:
```json
{
  "sourceFileId": "1g92XkL0029",
  "sourceDrive": "google_drive",
  "targetPath": "/OneDrive/Backup/Doc.pdf",
  "targetDrive": "onedrive",
  "verifyChecksum": true
}
```
- **Response**: `200 OK`
```json
{
  "jobId": "job_99812",
  "status": "active",
  "estimatedSecondsRemaining": 12
}
```
