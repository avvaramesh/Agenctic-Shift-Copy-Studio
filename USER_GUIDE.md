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

## 4. Using the Agentic AI Migration Assistant

### How to Run Natural Language Migration Commands:
1. Open **Storage Analyzer** $\rightarrow$ **Agentic AI Migration Assistant**.
2. Type a natural language command into the prompt bar, e.g.:
   > *"Find all research thesis PDFs in Google Drive from 2023, organize into OneDrive/Thesis_Vault/, and quarantine older duplicates."*
3. Click **"Generate Plan"**.
4. Review the **Human-in-the-Loop (HITL) Interactive Plan Checklist**.
5. Check or uncheck individual steps. Destructive actions are unchecked by default for safety.
6. Click **"Approve & Safely Execute"** to start the deterministic backend streaming copy.
7. Click the **"Agent ReAct Trace"** tab to inspect the agent's step-by-step thinking loop.
