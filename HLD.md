# HIGH-LEVEL DESIGN (HLD) DOCUMENT: SHIFT COPY STUDIO

## 1. System Vision & Organizational Context
Shift Copy Studio is an enterprise-grade, cloud-native file migration and intelligent storage orchestration platform. It enables seamless, high-speed streaming transfers, zero-byte transfer deduplication, Gemini AI vector-based project clustering, and autonomous agentic storage management across multi-cloud environments (Google Drive, Microsoft OneDrive, Local Vaults, and S3-compatible endpoints).

---

## 2. High-Level System Architecture

```
                               ┌────────────────────────────────────────┐
                               │           Web Client (React)           │
                               │  • Dual-Pane Directory Explorer        │
                               │  • Human-in-the-Loop Approval Drawer   │
                               │  • Knowledge Graph & D3 Storage Map    │
                               └───────────────────┬────────────────────┘
                                                   │ HTTPS / WebSockets
                                                   ▼
                               ┌────────────────────────────────────────┐
                               │   Express Application Server (Node)   │
                               │  • Auth Session & Token Vault          │
                               │  • ReAct Agentic Orchestrator          │
                               │  • Streaming Proxy & Byte Pipelines    │
                               └───────┬────────────────┬───────────────┘
                                       │                │
            ┌──────────────────────────┘                └──────────────────────────┐
            ▼                                                                      ▼
┌──────────────────────────┐                                            ┌──────────────────────────┐
│   Google Drive API v3    │                                            │  Microsoft Graph API v1.0│
│  • OAuth 2.0 PKCE        │                                            │  • OAuth 2.0 Authorization│
│  • Chunked Resumable Up  │                                            │  • Large File Stream Upload │
└──────────────────────────┘                                            └──────────────────────────┘
            │                                                                      │
            └──────────────────────────┬───────────────────────────────────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │    Gemini AI & Vector Engine   │
                       │ • text-embedding-004 Indexer   │
                       │ • ReAct Reasoning Loop Agent   │
                       │ • pHash Media Matcher Engine   │
                       └────────────────────────────────┘
```

---

## 3. Multi-Architecture Design Patterns & Layer Specifications

### 3.1 Multi-Cloud Storage Gateway Architecture
Shift Copy Studio abstracts provider-specific REST interfaces (Google Drive v3 API, Microsoft Graph API v1.0, POSIX Local Storage) behind a unified, polymorphic `StorageAdapter` interface. Each adapter implements chunked streaming, token refresh callbacks, and checksum normalization (`md5Checksum`, `sha1Hash`, `quickXorHash`).

### 3.2 Multi-Engine Intelligence & RAG Pipeline Architecture
- **Agentic ReAct Orchestrator**: Uses Gemini reasoning to break down natural language user intent into step-by-step action graphs.
- **Vector Indexing Engine**: Generates 768-dimensional dense vector embeddings using Gemini `text-embedding-004` to compute cosine similarity clusters across dispersed cloud drives.
- **Perceptual Hash Media Engine**: Computes 64-bit DCT perceptual image hashes (`pHash`) and calculates Hamming distance for visual diff matching.

### 3.3 Multi-Tier Runtime System Architecture
- **Presentation Tier**: React 18 SPA with responsive dual-pane views, SVG Knowledge Graphs, and D3 Treemaps.
- **Application & Proxy Tier**: Express.js Node server providing chunked streaming proxies and token vaults.
- **Container Gateway Tier**: Cloud Run containerized deployment binding to port 3000 with reverse-proxy ingress routing.

---

## 4. Algorithmic Specifications & Mathematical Models

### 4.1 Perceptual Hashing & Media Hamming Distance (`pHash`)
To compare media assets across cloud storage accounts without performing full payload downloads, Shift Copy Studio uses 64-bit Discrete Cosine Transform (DCT) Perceptual Hashing:
$$\text{pHash}(I) = \text{DCT}_{64}(\text{Grayscale}(\text{Resize}(I, 32 \times 32)))$$
Visual similarity between two media items $A$ and $B$ is calculated via bitwise XOR Hamming Distance:
$$\Delta(A, B) = \text{popcount}(\text{pHash}(A) \oplus \text{pHash}(B))$$
- **$\Delta \le 5$**: High-confidence visual match ($\ge 99.8\%$ similarity), triggering the Compression Heatmap Inspector.
- **$\Delta > 5$**: Distinct media assets.

### 4.2 Cosine Similarity Vector Project Clustering
Scattered files across Google Drive and OneDrive are embedded into 768-dimensional float vectors using Gemini `text-embedding-004`:
$$\mathbf{v}_i = \text{GeminiEmbed}(\text{FileName}_i \parallel \text{PathAncestry}_i \parallel \text{MimeType}_i)$$
Cosine affinity $S_C$ between file vectors $\mathbf{v}_i$ and project cluster centroid $\mathbf{c}_k$ determines virtual project membership:
$$S_C(\mathbf{v}_i, \mathbf{c}_k) = \frac{\mathbf{v}_i \cdot \mathbf{c}_k}{\|\mathbf{v}_i\| \|\mathbf{c}_k\|}$$
Threshold $S_C \ge 0.78$ automatically assigns files to synthesized cross-drive virtual project folders.

### 4.3 ReAct (Reasoning + Action) Agentic Loop
The Agentic Migration Assistant evaluates natural language user intent via an iterative loop:
$$\text{Input Intent} \longrightarrow \left[ \text{Thought}_t \longrightarrow \text{ToolCall}_t \longrightarrow \text{Observation}_t \right]^* \longrightarrow \text{Action Plan Graph}$$
Destructive tool calls (such as `purge_duplicate_files`) undergo mandatory Human-in-the-Loop (HITL) validation before dispatch.

---

## 5. Core Architectural Modules

### Module 1: Dual-Pane Directory & Stream Engine
- **Responsibility**: Provides real-time listing, pagination, and multi-threaded streaming transfers between source and destination endpoints.
- **Security & Auth**: Handles OAuth 2.0 token refreshes and short-lived scoped Bearer tokens without exposing secrets to the browser.

### Module 2: Cross-Drive Deduplication & Perceptual Matcher
- **Responsibility**: Detects identical or visually similar files across separate cloud storage providers.
- **Mechanisms**: Cryptographic hash comparison (`MD5` vs `SHA-1` / `QuickXorHash`) and `pHash` (Perceptual Hashing) for 99.8% media similarity detection.

### Module 3: Gemini Vector Project Clustering Engine
- **Responsibility**: Groups unorganized files across cloud accounts into semantic virtual projects using Gemini `text-embedding-004` vector representations.
- **Output**: Generates human-readable titles, cross-drive virtual folders, and interactive SVG knowledge graphs.

### Module 4: Agentic Storage Orchestrator (ReAct + Human-in-the-Loop)
- **Responsibility**: Translates natural language requests into deterministic execution plans.
- **Safety Boundary**: Air-gaps LLM reasoning from actual storage execution. All destructive operations (deletions/purges) require explicit user approval in the Human-in-the-Loop (HITL) drawer.

---

## 4. Enterprise Security, Governance & Compliance
- **Zero Data Retention Policy**: File streams pass through RAM buffers in transit; no user payload data is written to permanent server disk during transfer.
- **Token Security**: Tokens are stored encrypted in HTTP-only cookies with SameSite lax constraints.
- **Safe Quarantine Buffer**: Replaces permanent deletion with a 30-day auto-expiry quarantine folder (`/_ShiftCopy_Quarantine/`).
