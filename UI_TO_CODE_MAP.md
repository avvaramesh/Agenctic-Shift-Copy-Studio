# 🗺️ Shift Copy Studio: UI-to-Code Trace Matrix & Architectural Map

> **Document Version**: 2.5.0  
> **Target Audience**: Technical Evaluators, Core Maintainers & Code Reviewers  
> **Purpose**: Provides an explicit, 1-to-1 mapping from every UI view, button click, and interactive control directly to its underlying **React components**, **state variables**, **event handlers**, **Express REST API endpoints**, and **TypeScript domain types**.

---

## 🏛️ Comprehensive Module Mapping Index

1. [Module 1: Dual-Pane Directory Explorer](#1-dual-pane-directory-explorer)
2. [Module 2: Interactive Storage Knowledge Web Graph](#2-interactive-storage-knowledge-web-graph)
3. [Module 3: Cross-Drive Deduplication Matrix & Visual Diff Inspector](#3-cross-drive-deduplication-matrix)
4. [Module 4: Gemini AI Vector Project Clustering & Knowledge Graph](#4-gemini-ai-vector-project-clustering)
5. [Module 5: Agentic AI Orchestrator & HILP Safety Policy](#5-agentic-ai-orchestrator)
6. [Module 6: Storage Treemap, Waste Analyzer & Multi-Engine Telemetry](#6-storage-treemap--multi-engine-telemetry)

---

## 1. Dual-Pane Directory Explorer

**UI Location**: Main Tab `Dual-Pane Explorer` (`Navbar.tsx` $\rightarrow$ `activeTab === "explorer"`)

### Component Architecture
- **Primary View**: `/src/App.tsx`
- **Sub-components**:
  - `/src/components/DirectoryPane.tsx` (Renders individual source or target drive tree)
  - `/src/components/CopyConfigModal.tsx` (Pre-transfer configuration modal)
  - `/src/lib/virtualStorage.ts` (Virtual Drive storage provider)

### Trace Matrix

| UI Component / Action | React State / Hook | Handler Function | REST API Endpoint | Data Model / Types |
| :--- | :--- | :--- | :--- | :--- |
| **Drive Selector Dropdown** | `locationType` | `handleLocationChange()` | `GET /api/drive/list` | `StorageLocationType`, `SelectedFolderState` |
| **Directory Navigation** | `currentPath` | `handleFolderClick()` | `GET /api/drive/list?folderId=...` | `DriveItem`, `FolderPathSegment` |
| **Item Multi-Select** | `selectedItemIds` | `toggleSelectItem()` | N/A (Client State) | `Set<string>` |
| **Initiate Transfer Button** | `isConfigModalOpen` | `handleInitiateCopy()` | `POST /api/drive/copy` | `CopyOptions`, `CopyJob` |
| **Layout Toggle (Side-by-Side vs Stacked)** | `paneLayoutMode` | `setPaneLayoutMode()` | N/A (Client State) | `'side_by_side' \| 'stacked'` |

---

## 2. Interactive Storage Knowledge Web Graph

**UI Location**: `Storage Analyzer` $\rightarrow$ Subtab `Interactive Storage Web Graph` (`StorageAnalyzer.tsx` $\rightarrow$ `activeSubTab === "web_graph"`)

### Component Architecture
- **Primary View**: `/src/components/StorageWebGraph.tsx`
- **Sub-components**: Interactive 2D Physics Canvas, Mode Ribbon, Control Toolbar, Node Inspector Drawer

### Trace Matrix

| UI Component / Action | React State / Hook | Handler Function | Physics / Processing | Data Model / Types |
| :--- | :--- | :--- | :--- | :--- |
| **View Mode Ribbon** (`Full Web`, `Duplicates`, `Vector Clusters`) | `viewMode` | `setViewMode()` | Filters `filteredNodes` & `filteredEdges` | `'ALL_NODES' \| 'DUPLICATES_ONLY' \| 'VECTOR_SEMANTIC'` |
| **Physics Repulsion Slider** | `repulsion` | `setRepulsion()` | Coulomb repulsion force multiplier ($100 \rightarrow 800$) | `number` |
| **Interactive Node Drag** | `draggedNodeId` | `handleNodeMouseDown()` | Pins $(x, y)$ coordinates during drag | `GraphNode` |
| **Canvas Pan & Zoom** | `pan`, `zoom` | `handleCanvasMouseDown()`, `handleZoomIn()` | SVG transform matrix `translate(pan.x, pan.y) scale(zoom)` | `{ x: number, y: number }`, `number` |
| **Node Inspection Drawer** | `selectedNode` | `setSelectedNode()` | Displays path, drive, size, hash, pHash | `GraphNode`, `GraphEdge` |
| **1-Click Transfer Node Action** | N/A | `onSelectForTransfer()` | Switches view to Dual-Pane Explorer with preset payload | `SelectedFolderState` |

---

## 3. Cross-Drive Deduplication Matrix

**UI Location**: `Storage Analyzer` $\rightarrow$ Subtab `Deduplication Matrix (MD5/pHash)` (`StorageAnalyzer.tsx` $\rightarrow$ `activeSubTab === "matrix"`)

### Component Architecture
- **Primary View**: `/src/components/DeduplicationMatrix.tsx`
- **Sub-components**: Duplicate Pair Row, High-Res Visual Diff Inspector, Compression Heatmap Overlay Drawer

### Trace Matrix

| UI Component / Action | React State / Hook | Handler Function | REST API Endpoint | Data Model / Types |
| :--- | :--- | :--- | :--- | :--- |
| **Dedupe Scan Trigger** | `isScanning` | `runDedupeScan()` | `POST /api/dedupe/scan` | `DuplicateGroup`, `DuplicateItemPair` |
| **Toggle Heatmap Overlay** | `isHeatmapActive` | `toggleHeatmapOverlay()` | N/A (Canvas Shader) | `boolean` |
| **Quarantine Group Action** | `quarantinedIds` | `handleQuarantineGroup()` | `POST /api/dedupe/quarantine` | `QuarantineActionPayload` |

---

## 4. Gemini AI Vector Project Clustering

**UI Location**: `Storage Analyzer` $\rightarrow$ Subtab `Smart AI Project Clustering` (`StorageAnalyzer.tsx` $\rightarrow$ `activeSubTab === "clustering"`)

### Component Architecture
- **Primary View**: `/src/components/SmartProjectClustering.tsx`
- **Sub-components**: Vector Similarity Slider, Cluster Cards Grid, Physical Consolidation Drawer

### Trace Matrix

| UI Component / Action | React State / Hook | Handler Function | REST API Endpoint | Data Model / Types |
| :--- | :--- | :--- | :--- | :--- |
| **Cosine Similarity Threshold Slider** | `similarityThreshold` | `setSimilarityThreshold()` | Re-computes cluster adjacency matrix | `number` ($0.50 \rightarrow 0.95$) |
| **Generate Vector Embeddings** | `isGenerating` | `generateEmbeddings()` | `POST /api/gemini/cluster` (Calls `text-embedding-004`) | `ProjectCluster`, `VectorEmbedding` |
| **Consolidate Cluster Action** | `consolidatingId` | `handleConsolidateCluster()` | `POST /api/gemini/consolidate` | `ConsolidationRequest` |

---

## 5. Agentic AI Orchestrator

**UI Location**: `Storage Analyzer` $\rightarrow$ Subtab `Agentic AI Migration Assistant` (`StorageAnalyzer.tsx` $\rightarrow$ `activeSubTab === "agentic"`)

### Component Architecture
- **Primary View**: `/src/components/AgenticOrchestrator.tsx`
- **Sub-components**: Prompt Input Bar, ReAct Trace Log Drawer, HILP Interactive Step Checklist, MCP Skill Registry, User Rules Vault, Evals Gauge Dashboard

### Trace Matrix

| UI Component / Action | React State / Hook | Handler Function | REST API Endpoint | Data Model / Types |
| :--- | :--- | :--- | :--- | :--- |
| **Natural Language Prompt Input** | `userPrompt` | `handleGeneratePlan()` | `POST /api/agent/plan` (Gemini ReAct Loop) | `AgentGraphState`, `ReActTraceStep` |
| **HILP Step Checkbox Toggle** | `stepChecklist` | `toggleStepCheck()` | N/A (Client State) | `StepPlan`, `StepItem` |
| **Approve & Safely Execute Plan** | `isExecuting` | `handleApproveAndExecute()` | `POST /api/agent/execute` | `AgentExecutionResult` |
| **Add Custom User Rule** | `longTermRules` | `addCustomRule()` | Persisted to `localStorage` | `UserPolicyRule` |

---

## 6. Storage Treemap & Multi-Engine Telemetry

**UI Location**: `Storage Analyzer` $\rightarrow$ Subtabs `Disk Treemap` & `Multi-Engine Telemetry`

### Component Architecture
- **Primary Views**: `/src/components/StorageTreemap.tsx`, `/src/components/EntropyAndWasteViewer.tsx`

### Trace Matrix

| UI Component / Action | React State / Hook | Handler Function | REST API Endpoint | Data Model / Types |
| :--- | :--- | :--- | :--- | :--- |
| **D3 Treemap Tile Click** | `selectedTile` | `handleTileClick()` | `GET /api/analytics/treemap` | `TreemapNode` |
| **Purge Waste Build Caches** | `selectedCaches` | `purgeSelectedCaches()` | `POST /api/analytics/purge` | `WasteAnalysisResult` |
| **Multi-Engine Speed Benchmark** | `engineMetrics` | `runTelemetryBenchmark()` | Benchmark metrics from Go/Rust/Python workers | `TelemetryMetric` |

---
*Shift Copy Studio Technical Documentation Suite — Version 2.5.0.*
