# USER GUIDE & OPERATING MANUAL: SHIFT COPY STUDIO

Welcome to **Shift Copy Studio**. This guide provides step-by-step instructions for managing, organizing, and migrating files across Google Drive, Microsoft OneDrive, and local vaults.

---

## 1. Dual-Pane Side-by-Side Explorer

### How to Transfer Files:
1. Navigate to the **Explorer** tab from the top navigation bar.
2. Select your **Source Drive** (e.g., Google Drive) on the left panel and your **Target Drive** (e.g., OneDrive) on the right panel.
3. Browse folders using the breadcrumb links or search bar.
4. Check the items you wish to transfer.
5. Click **"Use as Source"** or **"Transfer Selected"** at the bottom to initiate a background streaming job.

---

## 2. Resolving Duplicates with Module 2 (Deduplication Matrix)

### How to Purge Redundant Files Safely:
1. Click **Storage Analyzer** $\rightarrow$ **Module 2: Deduplication Matrix**.
2. Review the detected duplicate clusters.
3. Click **"Inspect Visual Diff"** on any pair to open the Side-by-Side Comparison Drawer.
4. Toggle **"Compression Heatmap Overlay"** to see cropped or re-compressed regions.
5. Choose an automated resolution preset:
   - **Keep Highest Quality**: Preserves 4K original files while removing downscaled copies.
   - **Keep Master Drive**: Retains Google Drive copies and cleans OneDrive.
   - **Safe Quarantine First**: Moves files to `/_ShiftCopy_Quarantine/` for 30-day safe recovery.

---

## 3. Organizing Files with Module 3 (Smart Gemini Clustering)

### How to Create Virtual Project Workspaces:
1. Navigate to **Storage Analyzer** $\rightarrow$ **Smart AI Project Clustering**.
2. Click **"Re-Cluster with Gemini"** to run vector embedding analysis (`text-embedding-004`).
3. View auto-generated project folders (e.g., *CS401 Distributed Systems Thesis*).
4. Select a virtual project to see all related files combined from Google Drive and OneDrive.
5. Click **"Consolidate Physical Folders"** to move all scattered items into a single physical master directory.
6. Toggle **"Interactive Knowledge Graph"** to inspect the visual node map.

---

## 5. Multi-Engine Telemetry & Crawl Diagnostics

### How to Inspect High-Speed Crawl Performance:
1. Click **Storage Analyzer** $\rightarrow$ **Multi-Engine Telemetry (Go/Rust/Python)**.
2. Click **"Run Multi-Engine Drive Scan"** to simulate real-time telemetry updates.
3. Observe live throughput stats:
   - **Go Indexing Worker**: Displays Goroutine channel count and crawling speed (e.g., 14,200 items/sec).
   - **Rust Deduplication Engine**: Displays zero-copy stream hashing rate (xxHash64 & SHA-256 at 1.8 GB/sec).
   - **Python ML Intelligence Engine**: Displays perceptual hash computation speed (`pHash` DCT calculations) and TF-IDF topic vectorization latency.

---

## 6. Managing Active Transfers & Job Controls

### How to Monitor & Control Background Streaming Jobs:
1. Click **Active Transfers** in the top navigation bar.
2. View real-time streaming speed graphs (MB/s), file progress counters, and active worker thread allocations.
3. Use the control buttons:
   - ⏸️ **Pause**: Temporarily halts streaming chunk transfers without losing progress.
   - ▶️ **Resume**: Restores chunk streaming from the last offset.
   - 🛑 **Cancel**: Safely terminates the job and cleans up temporary target buffers.
4. Scroll through the **Live Streaming Log Console** to track individual file migration events in real time.

---

## 7. Transfer History & Exporting Audit Reports

### How to Audit Past Migrations:
1. Navigate to **Transfer History** from the top bar.
2. Filter historic jobs by status (*Completed*, *Failed*, *Paused*, *In Progress*) or search by job ID or folder name.
3. Click **"Download Audit Report"** to export execution logs as JSON or CSV files for compliance and record-keeping.

---

## 8. Storage Treemap & Waste Explorer

### How to Reclaim Wasted Storage:
1. Open **Storage Analyzer** $\rightarrow$ **Storage Treemap**.
2. Hover over rectangles in the D3 squarified treemap to see file sizes and file type distribution.
3. Click **Entropy & Waste Explorer** to view abandoned build caches (`node_modules`, `.next`, `dist`), stale video archives, and files untouched for $\ge 180$ days.
4. Click **"Purge Selected Waste"** to perform instant space reclamation.

