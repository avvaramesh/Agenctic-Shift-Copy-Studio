# SHIFT COPY STUDIO: Complete Feature Architecture & Specification

## Executive Overview
**Shift Copy Studio** is a high-speed, enterprise-grade cloud storage migration and intelligent file orchestration platform. It connects Google Drive, Microsoft OneDrive, and local vaults, offering zero-transfer cryptographic deduplication, Gemini AI vector project clustering, and an Agentic AI Migration Assistant with Human-in-the-Loop safeguards.

---

## 1. Dual-Pane Side-by-Side Folder Explorer
- **Responsive Dual-Pane Architecture**: Displays Source and Destination cloud directories side-by-side (Google Drive, OneDrive, Local Vault, or Shared Link).
- **Multi-Selection & Batch Operations**: Select multiple folders or individual files for streaming transfer.
- **Drive Mode Toggle**: Switch seamlessly between cloud drives, local storage, and direct public links.
- **Search & Filter Bar**: Instant client-side filtering by file name, file extension, and modification date.
- **Breadcrumb Navigation**: Deep nested folder drill-down with one-click ancestor breadcrumb navigation.
- **File & Grid View Modes**: Toggle between compact row lists and visual thumbnail grids.

---

## 2. Cross-Drive Deduplication Matrix & Visual Diff Inspector (Module 2)
- **Zero-Transfer Cryptographic & Perceptual Matching**:
  - Compares Google Drive `md5Checksum` against OneDrive `sha1Hash` and `quickXorHash`.
  - Integrates `pHash` (Perceptual Hashing) with 99.8% similarity detection for photos and videos.
- **Side-by-Side Visual Inspection Drawer**:
  - Displays high-resolution image thumbnails side-by-side with an interactive **Compression Heatmap Overlay** highlighting re-compressed or cropped regions.
  - Complete metadata diff table (resolution, dimensions, bit rate, created date, file size, hash fingerprints).
- **Automated Conflict Resolution Presets**:
  - **Rule 1 ("Keep Highest Quality / Resolution")**: Automatically marks lower-resolution or higher-compression copies for purge while preserving master 4K originals.
  - **Rule 2 ("Keep Primary Account Master")**: Designates Google Drive as source-of-truth master and purges secondary OneDrive copies.
  - **Rule 3 ("Safe Quarantine First")**: Moves purged items to `/_ShiftCopy_Quarantine/` for a 30-day safe recovery window instead of permanent deletion.

---

## 3. Smart Project Clustering Engine & Knowledge Graph (Module 3)
- **Gemini Vector Embedding Intelligence**:
  - Leverages Gemini `text-embedding-004` to vector-index filename semantics, path ancestry, extension relationships, and metadata.
  - Auto-assigns human-readable project titles (e.g., *"CS401 Distributed Systems Final Project & Lab Datasets (2024)"*).
- **Synthesized Cross-Drive Virtual Folder Workspace**:
  - Combines files scattered across Google Drive and OneDrive into a single virtual folder view.
  - Offers **1-Click Physical Folder Consolidation** to merge scattered items into a physical master directory.
- **Interactive Knowledge Graph Network**:
  - Visual SVG node map displaying file and cluster relationships.
  - Nodes color-coded by drive source (🔵 Google Drive vs. 🟢 OneDrive vs. 🟡 Gemini Project Hubs) with cosine affinity match scores.

---

## 4. Agentic AI Storage Assistant & Human-in-the-Loop Safeguard
- **Natural Language Intent Execution**:
  - Accepts prompts such as *"Find all 2023 marketing proposals in Google Drive, categorize by client, and archive to OneDrive while purging older duplicates."*
- **Human-in-the-Loop (HITL) Interactive Plan Checklist**:
  - Generates a step-by-step proposed migration checklist before taking action.
  - **Safety Defaults**: Destructive steps (e.g., purging duplicates) are **unchecked by default**.
  - Users can review, toggle, approve, or exclude individual steps prior to execution.
- **ReAct Agent Reasoning Trace Log**:
  - Live inspection log showing the agent's internal loop (`Thought` → `Tool Call` → `Observation`).
- **Long-Term Memory & Skill Directory**:
  - Remembers user preferences (*"Keep Google Drive as Master"*, *"30-Day Quarantine Buffer"*, *"SHA-256 Hash Verification"*).
  - Catalogue of exposed deterministic backend tools (`search_files_semantic`, `stream_file_transfer`, `quarantine_duplicates`).

---

## 5. Storage Analytics & Waste Explorer
- **Interactive Hierarchical Treemap (D3/SVG)**:
  - Visual breakdown of storage allocation across accounts with size-weighted color coding.
- **Entropy & Waste Analysis**:
  - Identifies abandoned build caches (`node_modules`, `.next`, `dist`), stale video archives, and ghost files.
- **Smart Optimization Recommendations**:
  - AI-driven suggestions for bandwidth savings and storage reclamation.

---

## 6. Multi-Engine Architecture (Node.js / Go / Rust / Python)
- **Node.js / Express Orchestrator**: Manages UI state, Google Drive API session authentication, token refresh vault, and streaming proxy routes (`server.ts`).
- **Go Indexing Worker**: Parallelized fan-out crawler fetching paginated Google Drive v3 and OneDrive API listings (simulating 14,200 items/sec throughput via Goroutines).
- **Rust Deduplication Engine**: High-speed zero-copy stream hashing across cloud chunks for exact byte-level file matching (xxHash64 & SHA-256 at 1.8 GB/sec).
- **Python ML Intelligence Engine**: Evaluates perceptual photo matching (`pHash`), TF-IDF document topic vectorization, and folder entropy scoring for cold storage detection.

---

## 7. Live Job Streaming & Migration Engine
- **Active Job Dashboard**:
  - Real-time streaming speed graphs (MB/s), estimated completion time, active workers count, and retry handlers.
  - Pause, resume, and cancel controls.
- **Job History Audit Log**:
  - Filterable transaction logs recording past migration jobs with status badges, byte counts, and execution timestamps.
- **Advanced Copy Configuration**:
  - Customizable parallel worker threads (1-16 workers), chunk sizes, bandwidth limits, and SHA-256 checksum verification.

---

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion / Framer Motion.
- **AI & ML**: Gemini API (`text-embedding-004`), Perceptual Hash (`pHash`), ReAct Agent Pattern.
- **Build System**: Vite, Express.js server on Cloud Run.
