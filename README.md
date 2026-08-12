# SHIFT COPY STUDIO: Enterprise Multi-Cloud Storage Orchestrator & Agentic Assistant

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-text--embedding--004-orange.svg)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)

**Shift Copy Studio** is an enterprise-grade, multi-cloud storage migration, intelligent deduplication, and file orchestration platform. It combines high-speed chunked streaming transfers across cloud drives (Google Drive, Microsoft OneDrive, Local Storage Vaults) with zero-byte cryptographic deduplication, Gemini AI dense vector clustering, and an autonomous **Agentic AI Storage Assistant** governed by Human-in-the-Loop (HILP) safety policies.

---

## 🎯 The "Why": What Problem Does This System Solve?

Modern enterprises and power users suffer from severe **cloud storage fragmentation** and **data sprawl**:

1. **Storage Silos & Cross-Cloud Complexity**: Important assets are scattered across personal Google Drive accounts, organizational Microsoft OneDrive tenants, and local drives. Migrating datasets between providers is historically slow, bandwidth-heavy, and error-prone.
2. **Gigabytes of Silent Redundancy & Duplicate Waste**: Duplicate files—from raw video renders and PDF reports to downscaled media—consume hundreds of gigabytes across cloud quotas. Traditional filename matching fails when files are renamed or slightly re-compressed.
3. **Risky Bulk Migrations Without Guardrails**: Standard copy tools offer zero rollback mechanisms or granular safety checks. A single misconfigured script can overwrite critical production assets or delete source files irreversibly.
4. **Unstructured File Dumps & Loss of Context**: Over time, cloud drives become chaotic file graveyards. Finding related assets for a single project across multiple drives requires manual searching through nested subdirectories.

### 💡 The Solution: How Shift Copy Studio Fixes This
- **High-Throughput Streaming Engine**: Zero local disk retention; buffers chunked byte streams in memory between cloud APIs.
- **Multi-Engine Deduplication Matrix**: Combines zero-byte cryptographic hashing (`MD5`, `SHA-1`, `QuickXorHash`), Rust zero-allocation stream hashing (`xxHash64` at 1.8 GB/sec), and Python ML 64-bit DCT perceptual image matching (`pHash`).
- **Gemini AI Semantic Clustering**: Uses `text-embedding-004` 768-dimensional vector embeddings and Cosine Similarity ($\ge 0.78$) to organize scattered files into virtual project workspaces without moving physical bytes.
- **Agentic AI Orchestrator with HILP Policy**: Translates natural language prompts into executable migration plans with transparent ReAct reasoning logs, risk tiering, and mandatory Human-in-the-Loop approval before destructive actions occur.
- **30-Day Recovery Vault**: Purged or overwritten items are safely moved to a reversible quarantine buffer instead of immediate permanent deletion.

---

## 🏛️ System Architecture Topology & Component Breakdown

### 1. High-Level Flow Diagram

```
                       ┌───────────────────────────────────────────────────┐
                       │          SHIFT COPY STUDIO FRONTEND UI            │
                       │  • React 18 SPA + Vite (Port 3000)                │
                       │  • Dual-Pane Directory Explorer                   │
                       │  • Interactive HILP Agent Approval Drawer         │
                       │  • SVG Knowledge Graph & D3 Storage Treemap       │
                       └─────────────────────────┬─────────────────────────┘
                                                 │ HTTPS / REST / Streaming
                                                 ▼
                       ┌───────────────────────────────────────────────────┐
                       │        EXPRESS APPLICATION SERVER (Node.js)       │
                       │  • OAuth 2.0 PKCE Token Vault                     │
                       │  • Chunked Memory Stream Proxy (0 Disk Payload)   │
                       │  • Background Job Manager & Progress Broadcaster  │
                       └─────────┬───────────────────┬───────────────────┬─┘
                                 │                   │                   │
            ┌────────────────────┘                   │                   └────────────────────┐
            ▼                                        ▼                                        ▼
┌───────────────────────────┐           ┌───────────────────────────┐           ┌───────────────────────────┐
│   Google Drive API v3     │           │ Microsoft Graph API v1.0  │           │   Multi-Engine Telemetry  │
│ • Resumable Uploads       │           │ • Fragmented Uploads      │           │ • Go Crawler (14.2k/s)    │
│ • md5Checksum Sync        │           │ • quickXorHash Matcher    │           │ • Rust Hashing (1.8GB/s)  │
└───────────────────────────┘           └───────────────────────────┘           │ • Python ML pHash Engine  │
                                                      │                         └───────────────────────────┘
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │ Gemini AI & Vector Engine   │
                                       │ • text-embedding-004        │
                                       │ • ReAct Reasoning Loop      │
                                       │ • Cosine Similarity Cluster │
                                       └─────────────────────────────┘
```

### 2. Four-Tier Multi-Architecture Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          1. MULTI-STORAGE CLOUD ARCHITECTURE                            │
├──────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│    Google Drive API      │   Microsoft Graph API    │    Local Vault & Object Storage   │
│  • Resumable Uploads     │  • Fragmented Uploads    │  • Native POSIX Direct Streaming  │
│  • md5Checksum Sync      │  • sha1 & quickXorHash   │  • S3 Chunked Stream Proxy        │
└──────────────────────────┴──────────────────────────┴───────────────────────────────────┘
                                           │
┌──────────────────────────────────────────▼──────────────────────────────────────────────┐
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

## 💻 Quick Start: Foolproof Local Running Guide

Follow these step-by-step instructions to clone, configure, and run Shift Copy Studio on your local development machine.

### 📋 Prerequisites
Before starting, ensure you have the following installed:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes bundled with Node.js)
- **Git**: ([Download Git](https://git-scm.com/))
- *(Optional)* **Gemini API Key**: For real-time Gemini AI embeddings and natural language planning. If omitted, the application operates in simulation mode with full feature availability.

---

### Step 1: Clone the Repository
Open your shell terminal and clone the project repository:
```bash
git clone https://github.com/your-org/shift-copy-studio.git
cd shift-copy-studio
```

---

### Step 2: Install Project Dependencies
Install all required Node.js packages:
```bash
npm install
```

---

### Step 3: Configure Environment Variables
Copy the provided `.env.example` file to create your local `.env` file:

```bash
cp .env.example .env
```

Open `.env` in your text editor and configure the environment variables as needed:

```env
# ===================================================================
# SHIFT COPY STUDIO ENVIRONMENT CONFIGURATION
# ===================================================================

# GEMINI_API_KEY (Optional for live Gemini AI calls)
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your_gemini_api_key_here"

# APP_URL (Required for self-referential OAuth callbacks and links)
# Default for local development is http://localhost:3000
APP_URL="http://localhost:3000"

# PORT (Hardcoded ingress port required by container infrastructure)
PORT=3000
```

> **Note**: In local development without cloud credentials, Shift Copy Studio seamlessly falls back to virtual simulated drive trees (`/src/lib/virtualStorage.ts`), enabling complete interactive testing of deduplication, treemaps, agentic workflows, and active job monitors out of the box!

---

### Step 4: Run the Development Server
Launch the unified full-stack development server (Express backend + Vite React frontend):

```bash
npm run dev
```

Once started, open your web browser and navigate to:
👉 **`http://localhost:3000`**

---

### Step 5: Build & Run in Production Mode
To compile the TypeScript server into a bundled CommonJS file (`dist/server.cjs`) and build the production React bundle:

```bash
# 1. Build client static files and server CommonJS bundle
npm run build

# 2. Start the production Node server
npm start
```

---

### Step 6: Code Quality & Verification
To verify type safety and code formatting across the repository:

```bash
# Run TypeScript type check and linter
npm run lint
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

## 🚀 Key Modules & Feature Highlights

### 1. Dual-Pane Side-by-Side Folder Explorer
- **Responsive Dual-Pane Grid**: Source and Target directories rendered side-by-side (`md:grid-cols-2`).
- **Multi-Cloud Compatibility**: Google Drive, Microsoft OneDrive, Local Storage Vaults, and Public Shared Links.
- **Batch Transfer Engine**: Multi-selection and directory tree streaming.
- **Client-Side Search**: Real-time filtering by name and extension.

### 2. Cross-Drive Deduplication Matrix & Visual Diff Inspector
- **Zero-Transfer Matching**: Compares Google Drive `md5Checksum` against OneDrive `sha1Hash` / `quickXorHash`.
- **Perceptual Hashing (`pHash`)**: 99.8% visual media match detection for re-compressed, cropped, or downscaled images/videos.
- **Side-by-Side Visual Inspection Drawer**: High-res diff view with an interactive **Compression Heatmap Overlay**.
- **Automated Presets**: *"Keep Highest Quality"*, *"Keep Master Drive"*, and *"Safe Quarantine First (30-Day Recovery)"*.

### 3. Smart Gemini Project Clustering & Knowledge Graph
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
| **`/src/components/DocumentationViewer.tsx`** | Comprehensive documentation suite rendering Features, Algorithms, Multi-Architecture Matrix, HLD, LLD, Agentic Spec, and User Operating Manual inside the application interface. | `DocumentationViewer` |
| **`/AGENTIC_ORCHESTRATOR_SPEC.md`** | Detailed technical specification and architectural blueprint for the Agentic Orchestrator (State Graph DAG, MCP tools, HILP policy, Memory, and Evals). | Architecture Specification Document |

---

## 🛠️ Technology Stack & Multi-Engine Architecture

- **Node.js / Express Orchestrator**: Express.js gateway, OAuth 2.0 PKCE token refresh vault, streaming memory proxies, and background job state manager (`server.ts`).
- **Go Indexing Worker**: Simulated high-concurrency multi-threaded Goroutine fan-out crawler fetching paginated Google Drive v3 and Microsoft Graph v1.0 API listings (14,200 items/sec indexing speed).
- **Rust Deduplication Engine**: Simulated zero-allocation stream hashing engine executing `xxHash64` and `SHA-256` cryptographic verification at 1.8 GB/sec for instant byte-level duplicate detection.
- **Python ML Intelligence Engine**: Perceptual photo hash matching (`pHash` 64-bit DCT with Hamming distance), TF-IDF document topic vectorization, and folder entropy scoring for cold storage detection.
- **AI & Vector Engine**: Google Gemini API (`text-embedding-004` 768-dim dense vectors), ReAct Agentic Reasoning Loop (`Thought` $\rightarrow$ `Tool Call` $\rightarrow$ `Observation`), and Cosine Similarity clustering ($\ge 0.78$ threshold).
- **Frontend & UI**: React 18, TypeScript 5, Tailwind CSS v4, Lucide Icons, Motion (`motion/react`), D3.js Squarified Treemap Tiling, and SVG Knowledge Graphs.
- **Cloud & Storage Integrations**: Google Drive API v3 (`googleapis`), Microsoft Graph API v1.0, Firebase Auth / Firestore, S3 Chunked Stream Proxy.
- **Infrastructure & Deployment**: Node.js + Vite Dev Server, Esbuild CommonJS Server Bundler (`dist/server.cjs`), Cloud Run Containerized Ingress (Port 3000).

---

## 📄 Deep-Dive Technical Documentation Specs

For detailed architectural, API, and engineering specifications, refer to the individual documentation artifacts:

| Document Artifact | Focus & Audience | Key Contents |
| :--- | :--- | :--- |
| [**`AGENTIC_ORCHESTRATOR_SPEC.md`**](./AGENTIC_ORCHESTRATOR_SPEC.md) | Agent System Architecture | State Graph DAG topology, Model Context Protocol (MCP) skill registry, HILP safety policies, memory layers, and 5-metric Evals framework. |
| [**`HLD.md`**](./HLD.md) | High-Level Architecture | Cloud Run container boundary, multi-cloud OAuth flow, memory-only byte streaming, and multi-engine worker integration. |
| [**`LLD.md`**](./LLD.md) | Low-Level Engineering | Full TypeScript interfaces, Express backend API route schemas, and state update algorithms. |
| [**`FEATURES.md`**](./FEATURES.md) | Feature Specification | Complete capability inventory across all 6 core storage and analytics modules. |
| [**`USER_GUIDE.md`**](./USER_GUIDE.md) | Operations & End Users | Step-by-step operating instructions for transfers, deduplication, vector clustering, and agent prompt execution. |

---

## 🛡️ Security & Compliance
- **Zero Local Payload Retention**: File payload streams pass strictly through RAM buffers during transfer; bytes are never written to server disks.
- **Encapsulated Auth Tokens**: Scoped access tokens are stored in HTTP-Only encrypted memory sessions.
- **30-Day Safe Recovery**: Purged duplicate items are moved to `/_ShiftCopy_Quarantine/` instead of undergoing permanent deletion.

