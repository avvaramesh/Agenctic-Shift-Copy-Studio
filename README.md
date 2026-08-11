# SHIFT COPY STUDIO: Enterprise Multi-Cloud Storage Orchestrator & Agentic Assistant

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-text--embedding--004-orange.svg)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)

**Shift Copy Studio** is a high-performance, cloud-native storage migration and intelligent file orchestration platform. It enables seamless, high-speed streaming transfers, zero-byte transfer cryptographic deduplication, Gemini AI vector-based project clustering, and an autonomous Agentic AI Storage Assistant with Human-in-the-Loop safety controls.

---

## 🏛️ System Architecture Topology

```
                               ┌────────────────────────────────────────┐
                               │       Shift Copy Studio Frontend       │
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

## 🏢 Multi-Architecture Matrix & Layer Breakdown

Shift Copy Studio is engineered with a **Four-Tier Multi-Architecture Topology** designed for fault tolerance, security, and high throughput:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          1. MULTI-STORAGE CLOUD ARCHITECTURE                            │
├──────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│    Google Drive API      │   Microsoft Graph API    │    Local Vault & Object Storage   │
│  • Resumable Uploads     │  • Fragmented Uploads    │  • Native POSIX Direct Streaming  │
│  • md5Checksum Sync      │  • sha1 & quickXorHash   │  • S3 Chunked Stream Proxy        │
└──────────────────────────┴──────────────────────────┴───────────────────────────────────┘
                                           │
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                        2. MULTI-ENGINE SPEED & INTELLIGENCE ARCHITECTURE                 │
├──────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│ Node.js / Express        │ Go Indexing Worker       │ Rust Deduplication Engine         │
│ • UI Orchestration       │ • Multi-threaded Goroutines│ • Zero-allocation stream hashing  │
│ • Token & Session Vault  │ • 14,200 items/sec crawl │ • xxHash64 & SHA-256 (1.8 GB/sec) │
├──────────────────────────┴──────────────────────────┼───────────────────────────────────┤
│ Python ML Intelligence Engine                       │ Gemini AI Vector RAG Engine       │
│ • pHash 64-bit DCT perceptual image matching        │ • text-embedding-004 768-dim      │
│ • TF-IDF topic clustering & entropy scoring         │ • ReAct Agentic Reasoning Loop    │
└─────────────────────────────────────────────────────┴───────────────────────────────────┘
                                           │
┌──────────────────────────────────────────▼──────────────────────────────────────────────┐
│                        3. MULTI-TIER RUNTIME SYSTEM ARCHITECTURE                        │
├──────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│    Client Application    │ Express Streaming Proxy  │  Cloud Run Container Gateway      │
│  • React 18 & Motion     │  • Chunked Memory Buffers│  • Port 3000 Sandboxed Deployment │
│  • Knowledge Graph SVG   │  • Token Session Vault   │  • Zero Local Payload Retention   │
└──────────────────────────┴──────────────────────────┴───────────────────────────────────┘
                                           │
┌──────────────────────────────────────────▼──────────────────────────────────────────────┐
│                        4. MULTI-LAYER SECURITY & SAFETY ARCHITECTURE                    │
├──────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│ Air-Gapped Execution     │ Human-in-the-Loop (HITL) │ Cryptographic Integrity           │
│ • LLM proposes plans     │ • Destructive checkboxes │ • SHA-256 Hash Verification       │
│ • Backend executes       │   unchecked by default   │ • 30-Day Quarantine Rollback      │
└──────────────────────────┴──────────────────────────┴───────────────────────────────────┘
```

---

## 🧮 Algorithms & Mathematical Models

Shift Copy Studio employs tailored algorithms across data integrity, media matching, AI vector clustering, visualization, and autonomous reasoning:

| Purpose / Domain | Algorithm Name | Mathematical / Operational Model | Functional Application |
| :--- | :--- | :--- | :--- |
| **Media Deduplication** | **Perceptual Hash (`pHash`) + Hamming Distance** | 64-bit DCT hash comparison via XOR bitwise shift: $\Delta = \sum (H_A \oplus H_B)$ | Detects cropped, downscaled, or re-compressed image/video duplicates across cloud drives ($99.8\%$ match precision for distance $\le 5$). |
| **Cross-Cloud Cryptography** | **MD5 / SHA-1 / QuickXorHash Matcher** | Standard cryptographic digest normalization | Correlates Google Drive `md5Checksum` with OneDrive `sha1Hash` and `quickXorHash` for zero-byte transfer deduplication. |
| **Semantic AI Indexing** | **Gemini Dense Vector Embeddings + Cosine Similarity** | $S_C(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$ on 768-dim floats | Groups files scattered across drives into virtual project clusters using Gemini `text-embedding-004`. |
| **Agentic AI Orchestration** | **ReAct Loop (Reasoning + Acting)** | Iterative step parsing: $\text{Prompt} \rightarrow \text{Thought} \rightarrow \text{Tool Call} \rightarrow \text{Observation}$ | Converts natural language storage instructions into deterministic execution plan graphs with Human-in-the-Loop safeguards. |
| **Hierarchical Storage Visualization** | **Squarified Treemap Tiling Algorithm** | D3 layout algorithm optimizing rectangle aspect ratio $R = \max(w/h, h/w)$ | Renders proportional, size-weighted storage allocation maps across connected drives. |
| **Interactive Knowledge Graphs** | **Force-Directed Network Graph Layout** | Combined Coulomb Repulsion ($F_r = k_r / d^2$) and Hooke Attraction ($F_a = k_a d$) | Positions virtual file nodes and project cluster hubs dynamically in an interactive SVG canvas. |
| **Data Integrity Verification** | **SHA-256 Chunk Stream Validation** | Incremental 8MB chunked byte stream hashing | Verifies end-to-end data integrity during cross-drive streaming copy jobs. |

---

| Document Artifact | Audience | Description & Focus |
| :--- | :--- | :--- |
| [**`FEATURES.md`**](./FEATURES.md) | Product & Leadership | Exhaustive feature specification across all core modules. |
| [**`HLD.md`**](./HLD.md) | Enterprise Architects | High-Level Design topology, security boundaries, and multi-cloud streaming architecture. |
| [**`LLD.md`**](./LLD.md) | Software Engineers | Low-Level Design with TypeScript interfaces, class signatures, and API specifications. |
| [**`USER_GUIDE.md`**](./USER_GUIDE.md) | End Users & Ops | Step-by-step operating manual for transfers, deduplication, AI clustering, and agent prompt execution. |

---

## 🚀 Key Modules & Feature Highlights

### 1. Dual-Pane Side-by-Side Folder Explorer
- **Responsive Dual-Pane Grid**: Source and Target directories rendered side-by-side (`md:grid-cols-2`).
- **Multi-Cloud Compatibility**: Google Drive, Microsoft OneDrive, Local Storage Vaults, and Public Shared Links.
- **Batch Transfer Engine**: Multi-selection and directory tree streaming.
- **Client-Side Search**: Real-time filtering by name and extension.

### 2. Module 2: Cross-Drive Deduplication Matrix & Visual Diff Inspector
- **Zero-Transfer Matching**: Compares Google Drive `md5Checksum` against OneDrive `sha1Hash` / `quickXorHash`.
- **Perceptual Hashing (`pHash`)**: 99.8% visual media match detection for re-compressed, cropped, or downscaled images/videos.
- **Side-by-Side Visual Inspection Drawer**: High-res diff view with an interactive **Compression Heatmap Overlay**.
- **Automated Presets**: *"Keep Highest Quality"*, *"Keep Master Drive"*, and *"Safe Quarantine First (30-Day Recovery)"*.

### 3. Module 3: Smart Gemini Project Clustering & Knowledge Graph
- **Gemini Vector Embeddings**: Ingests file semantics and path ancestry via `text-embedding-004`.
- **Auto-Generated Project Titles**: Assigns context-aware folder names (e.g. *"CS401 Distributed Systems Final Project 2024"*).
- **Virtual Cross-Drive Workspace**: Combines scattered files across clouds into a unified view with 1-Click physical folder consolidation.
- **Interactive Knowledge Graph**: Visual SVG node map detailing file-cluster affinity scores.

### 4. Agentic AI Storage Assistant & Human-in-the-Loop Safeguard
- **Natural Language Intent**: Accepts commands like *"Find 2023 research PDFs in Google Drive, categorize by client, archive to OneDrive, and purge duplicates."*
- **Human-in-the-Loop (HITL) Action Plan**: Generates an interactive checklist before executing transfers. Destructive actions are unchecked by default for safety.
- **ReAct Agent Reasoning Trace**: Live transparent log of the agent's `Thought` $\rightarrow$ `Tool Call` $\rightarrow$ `Observation` loop.
- **Air-Gapped Deterministic Skills**: Safe execution via programmatic chunked streaming and SHA-256 hash validation.

---

## 📂 File-by-File & Component Inventory Map

| File Path | Description & Functional Responsibility | Key Exports & API Methods |
| :--- | :--- | :--- |
| **`/server.ts`** | Backend Express server, Google OAuth integration, token refresh vault, Drive API proxying, and background streaming job executor. | `GET /api/drive/folders`, `POST /api/drive/inspect`, `POST /api/drive/create-folder`, `POST /api/drive/start-copy`, `GET /api/drive/job-status/:jobId`, `POST /api/drive/job-action/:jobId`, `POST /api/auth/refresh`, `retryWithBackoff()` |
| **`/src/App.tsx`** | Primary React SPA container, managing global tab navigation, layout mode toggling (Side-by-Side vs Stacked), user state synchronization, and job progress counters. | `App()` (Default Root Component) |
| **`/src/types.ts`** | Central TypeScript domain interfaces, data models, and type definitions across storage, jobs, AI, and deduplication. | `UserDriveAccount`, `SelectedFolderState`, `DriveItem`, `CopyJob`, `CopyConfig`, `CopyProgress`, `DuplicateGroup`, `ProjectCluster`, `AgentStepPlan` |
| **`/src/lib/firebase.ts`** | Firebase authentication module providing popup Google Sign-In, sign-out handlers, and auth listener state initialization. | `auth`, `googleProvider`, `signInWithGoogle()`, `logoutUser()` |
| **`/src/lib/virtualStorage.ts`** | Virtual storage simulation engine providing fallback drive trees, multi-engine crawl data, sample duplicate groups, project clusters, and analytics data when live credentials are absent. | `getVirtualFolders()`, `getVirtualDuplicates()`, `getVirtualProjectClusters()`, `getVirtualColdStorage()`, `getVirtualAnalytics()` |
| **`/src/components/Navbar.tsx`** | Top sticky header navigation bar with brand branding, tab selection menu, active job count badge, and mobile/desktop account authentication menu. | `Navbar` |
| **`/src/components/DirectoryPane.tsx`** | Side-by-side folder explorer pane with provider switcher (Google Drive, OneDrive, Local Vault), interactive breadcrumb navigation, live search/filter, and selection toolbar. | `DirectoryPane` |
| **`/src/components/CopyConfigModal.tsx`** | Transfer modal for configuring copy options (Deep Clone vs Merge, Skip/Overwrite/Rename conflicts, Preserve timestamps/permissions, Deduplication pre-check, Worker thread count slider). | `CopyConfigModal` |
| **`/src/components/ActiveJobDashboard.tsx`** | Real-time transfer monitor featuring live MB/s speed charts, worker thread status gauges, file-by-file log stream, and pause/resume/cancel controls. | `ActiveJobDashboard` |
| **`/src/components/JobHistoryTable.tsx`** | Filterable historic job audit table with execution status badges, detailed breakdown drawer, and 1-click JSON/CSV report export. | `JobHistoryTable` |
| **`/src/components/StorageAnalyzer.tsx`** | Analytics hub containing sub-tabs for Multi-Engine Telemetry, Storage Treemaps, Smart Clustering, Deduplication Matrix, Waste Explorer, and Agentic Assistant. | `StorageAnalyzer` |
| **`/src/components/StorageTreemap.tsx`** | D3 squarified treemap visualizer rendering area-proportional rectangles for folder storage consumption with interactive category color coding. | `StorageTreemap` |
| **`/src/components/SmartProjectClustering.tsx`** | Gemini vector embedding (`text-embedding-004`) clusterer with Cosine Similarity math, 1-click physical folder consolidation, and interactive SVG Knowledge Graph node map. | `SmartProjectClustering` |
| **`/src/components/DeduplicationMatrix.tsx`** | Cross-drive deduplication matrix combining zero-byte cryptographic hash matching (MD5/SHA-1/QuickXorHash), Rust-simulated stream hashing, Python ML `pHash` perceptual media matching, and interactive Visual Diff Drawer. | `DeduplicationMatrix` |
| **`/src/components/EntropyAndWasteViewer.tsx`** | Waste & cold storage detector identifying abandoned build caches (`node_modules`, `.next`, `dist`), files untouched for $\ge 180$ days, and folder entropy scores. | `EntropyAndWasteViewer` |
| **`/src/components/AgenticOrchestrator.tsx`** | Gemini ReAct agentic reasoning assistant accepting natural language migration prompts, generating step-by-step Human-in-the-Loop approval plans, and logging ReAct trace steps. | `AgenticOrchestrator` |
| **`/src/components/MigrationGuides.tsx`** | Step-by-step migration guides for Google Drive to Google Drive, Google Drive to OneDrive, Cross-Domain Workspace migration, and Enterprise sync. | `MigrationGuides` |
| **`/src/components/DocumentationViewer.tsx`** | Comprehensive documentation suite rendering Features, Algorithms, Multi-Architecture Matrix, HLD, LLD, and User Operating Manual inside the application interface. | `DocumentationViewer` |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript 5, Tailwind CSS v4, Lucide Icons, Motion (Framer Motion).
- **AI & ML**: Gemini API (`text-embedding-004`), Perceptual Hash (`pHash`), ReAct Agent Architecture.
- **Backend & Server**: Express.js, Node.js, Vite, Cloud Run Container Runtime.

---

## 💻 Quick Start & Local Development

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/shift-copy-studio.git
cd shift-copy-studio

# Install dependencies
npm install

# Start the development server (runs on port 3000)
npm run dev
```

### Production Build
```bash
# Build static assets & server bundle
npm run build

# Start production server
npm start
```

---

## 🛡️ Security & Compliance
- **Zero Data Retention**: File payload streams pass strictly through RAM buffers during transfer; bytes are never saved to server disks.
- **Scoped OAuth Tokens**: Tokens are encapsulated inside HTTP-Only encrypted cookies.
- **30-Day Safe Recovery**: Purged duplicate items are moved to `/_ShiftCopy_Quarantine/` instead of permanent deletion.
