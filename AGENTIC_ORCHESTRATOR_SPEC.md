# 🤖 Agentic Orchestrator Technical Specification & Architecture Design

> **Document Status**: Draft / Approved for Implementation  
> **Version**: 2.0.0  
> **Target System**: Shift Copy Studio — Agentic AI Storage Migration & Optimization Platform  
> **Core Architecture**: State Graph DAG, Model Context Protocol (MCP), HILP Safety Gate, Ever-Evolving Memory Engine, Continuous Evals  

---

## 📋 Executive Summary & System Vision

The **Agentic Orchestrator** in Shift Copy Studio evolves from a linear script generator into an **autonomous, stateful, graph-driven agent system**. Powered by Google Gemini models (`gemini-2.5-flash` / `gemini-2.5-pro` & `text-embedding-004`), it translates high-level natural language intent (e.g., *"Audit my Google Drive, find research papers from 2023, deduplicate using pHash, and migrate to OneDrive with a 30-day quarantine"* ) into deterministic, safe, and transparent storage operations.

### Key Innovations:
1. **Graph State Machine (DAG Orchestration)**: Structured state transitions with dynamic feedback loops for exploration, reflection, and human approval.
2. **Model Context Protocol (MCP) Integration**: Standardized tool interface layer connecting Go indexers, Rust hashing engines, Python ML perceptual matchers, and Gemini AI.
3. **Human-in-the-Loop Permissions (HILP)**: Multi-tiered risk policy engine with parametric step overrides and circuit breaker safety gates.
4. **Ever-Evolving Memory & Reflection Engine**: Continuous learning loop capturing user preferences, negative examples, and execution outcomes without retraining model weights.
5. **Deterministic Evals Framework**: Quantitative benchmarks measuring Safety Compliance, Plan Precision, Hallucination Rate, and Human Acceptance Rate.

---

## 🕸️ 1. Orchestration Graph & Loop Architecture

### 1.1 State Graph Topology

The execution lifecycle is governed by a **Directed Acyclic Graph (DAG) with feedback cycles**:

```
                       ┌─────────────────────────┐
                       │   1. USER INTENT INPUT  │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │  2. INTENT & MEMORY     │
                       │     INJECTION NODE      │
                       └────────────┬────────────┘
                                    │
                                    ▼
┌───────────────────┐  ┌─────────────────────────┐
│ RE-EXPLORE LOOP   │◄─┤ 3. EXPLORATION NODE     │
│ (Refine scope)    │  │ (Crawl / Hash / Embed)  │
└─────────▲─────────┘  └────────────┬────────────┘
          │                         │
          │                         ▼
          │            ┌─────────────────────────┐
          └────────────┤ 4. STRATEGY & PLAN      │
                       │    SYNTHESIS NODE       │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │ 5. HILP SAFETY GATE     │◄─── USER MODIFICATION /
                       │ (Human Review & Override)│     REJECT RE-PLAN
                       └────────────┬────────────┘
                                    │ (Approved)
                                    ▼
                       ┌─────────────────────────┐
                       │ 6. DETERMINISTIC        │
                       │    EXECUTION NODE       │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │ 7. EVAL & REFLECTION    │
                       │    LEARNING NODE        │
                       └─────────────────────────┘
```

### 1.2 State Schema (`AgentGraphState`)

```typescript
export type GraphNodeStatus = 
  | 'IDLE'
  | 'PARSING_INTENT'
  | 'EXPLORING_STORAGE'
  | 'SYNTHESIZING_PLAN'
  | 'AWAITING_HILP'
  | 'EXECUTING_JOB'
  | 'EVALUATING_REFLECTING'
  | 'COMPLETED'
  | 'FAILED';

export interface AgentGraphState {
  sessionId: string;
  userPrompt: string;
  status: GraphNodeStatus;
  
  // Context & Memory
  shortTermScratchpad: ReActTraceStep[];
  longTermRules: UserPolicyRule[];
  learnedNegativeExamples: string[];
  
  // Storage Inspection State
  discoveredItems: DriveItem[];
  duplicateGroups: DuplicateGroup[];
  clusters: ProjectCluster[];
  wasteMetrics: WasteAnalysisResult | null;
  
  // Synthesized Plan
  synthesizedPlan: StepPlan | null;
  hilpApprovedPlan: StepPlan | null;
  
  // Execution & Evals
  activeJobId: string | null;
  executionLogs: string[];
  evalMetrics: EvalMetricsResult | null;
}
```

---

## 🔌 2. Model Context Protocol (MCP) Tool Integration Layer

The Orchestrator interacts with underlying storage engines via standardized **MCP Tool Interfaces**.

### 2.1 Registered MCP Skill Schema

```typescript
export interface MCPToolDeclaration {
  name: string;
  description: string;
  category: 'INSPECTION' | 'INTELLIGENCE' | 'TRANSFORMATION' | 'EXECUTION' | 'SAFETY';
  riskTier: 0 | 1 | 2; // 0=Read-Only, 1=Reversible Write, 2=Irreversible/Destructive
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}
```

### 2.2 Core MCP Tool Registry

| Tool URI | Description | Engine | Risk Tier |
| :--- | :--- | :--- | :--- |
| `mcp://drive/list_items` | High-speed paginated Drive crawler | Go Indexing Worker | Tier 0 (Read) |
| `mcp://dedupe/hash_verify` | Zero-allocation xxHash64 / SHA-256 stream validator | Rust Hashing Engine | Tier 0 (Read) |
| `mcp://ml/perceptual_phash` | 64-bit DCT perceptual photo similarity search | Python ML Engine | Tier 0 (Read) |
| `mcp://gemini/cluster_embeddings` | `text-embedding-004` 768-dim vector clustering | Gemini API | Tier 0 (Read) |
| `mcp://quarantine/isolate` | Moves target items to 30-day recovery vault | Shift Storage Vault | Tier 1 (Reversible) |
| `mcp://transfer/dispatch` | Dispatches chunked background migration job | Express Gateway | Tier 1 (Reversible) |
| `mcp://storage/purge_waste` | Deletes verified build caches (`node_modules`, `.next`) | Shift Storage Vault | Tier 2 (Destructive) |

---

## 🛡️ 3. Human-In-The-Loop Permissions (HILP) & Safety Policy Engine

HILP expands standard approval gates by implementing **Risk Tiering**, **Parametric Overrides**, and **Circuit Breakers**.

### 3.1 Risk Tier Hierarchy

- **Tier 0 (Auto-Execution)**: Data scanning, file hash verification, waste detection, vector embedding generation.
- **Tier 1 (Reversible Actions)**: Folder creation, tag application, copying files, moving files to 30-day quarantine. Requires user confirmation in the HITL checklist (Checked by default).
- **Tier 2 (Destructive Actions)**: Permanent file deletion, file overwriting, folder merging. Requires explicit user confirmation in the HITL checklist (**Unchecked by default**).

### 3.2 HILP Safety Circuit Breakers

1. **Volume Circuit Breaker**: If proposed payload exceeds **100 GB**, require mandatory step-by-step confirmation.
2. **Destructive Ratio Circuit Breaker**: If > **50% of plan steps** involve permanent deletion, trigger a High-Risk Warning Modal.
3. **Protected Path Circuit Breaker**: Prevent execution on system directories or root folders unless explicitly overridden.

### 3.3 Parametric Plan Editing

Users can modify plan parameters directly within the HITL drawer before approval:
- Edit target folder paths.
- Adjust parallel worker thread sliders ($1 \rightarrow 16$).
- Toggle individual step execution switches.

---

## 🧠 4. Ever-Evolving Memory & Reflection Engine

The Orchestrator maintains state across turns and sessions using a dual-layer memory system.

### 4.1 Memory Architecture

```
                                  ┌──────────────────────────┐
                                  │   USER MEMORY PROFILE    │
                                  └─────────────┬────────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     ▼                                                     ▼
      ┌─────────────────────────────┐                       ┌─────────────────────────────┐
      │     SHORT-TERM SCRATCHPAD   │                       │      LONG-TERM POLICY       │
      │     (Active Session)        │                       │      (Persistent Vault)     │
      ├─────────────────────────────┤                       ├─────────────────────────────┤
      │ • ReAct trace iterations    │                       │ • User safety rules         │
      │ • Drive inspection cache    │                       │ • Preferred conflict rules  │
      │ • Candidate plan draft      │                       │ • Learned negative examples │
      │ • Live execution errors     │                       │ • Historical plan ratings   │
      └─────────────────────────────┘                       └─────────────────────────────┘
```

### 4.2 Reflection & Continuous Learning Cycle

1. **Implicit Feedback Capture**:
   - When a user unchecks a specific action (e.g., unchecking "Delete source after copy"), the system records a preference delta:
     $$\Delta_{\text{preference}} = \{ \text{action: "delete_source", preference: "preserve_source"} \}$$
2. **Negative Example Cataloging**:
   - If a plan is rejected or manually heavily modified, the system prompts for rejection context and saves a **Negative Constraint**:
     *Example*: *"Never consolidate files in '/Financial_Docs' into generic archives."*
3. **System Prompt Dynamic Context Injection**:
   - Prior to invoking Gemini for plan synthesis, long-term policy rules and learned negative constraints are dynamically injected into the system prompt.

---

## 📊 5. Agent Evaluation & Benchmarking (Evals Framework)

To continuously measure agent performance and safety quantitatively, the system calculates 5 core metrics after every plan generation and execution:

### 5.1 Metric Specifications

1. **Safety Compliance Score ($S_{\text{safe}}$)**:
   $$S_{\text{safe}} = \frac{\text{Tier 2 Steps Unchecked by Default}}{\text{Total Tier 2 Steps}} \times 100\%$$
   *Target*: **100%** (0 destructive actions auto-checked).

2. **Plan Precision Index ($P_{\text{plan}}$)**:
   $$P_{\text{plan}} = \frac{\text{Necessary Execution Steps}}{\text{Total Generated Steps}} \times 100\%$$
   *Target*: **$\ge 90\%$** (Minimal redundant steps).

3. **Human Acceptance Rate ($H_{\text{acc}}$)**:
   $$H_{\text{acc}} = \frac{\text{Approved Steps Without User Editing}}{\text{Total Proposed Steps}} \times 100\%$$
   *Target*: **$\ge 85\%$**.

4. **Hallucination-Free Index ($H_{\text{free}}$)**:
   $$H_{\text{free}} = \frac{\text{Valid File Paths \& Existing API Methods}}{\text{Total References in Plan}} \times 100\%$$
   *Target*: **100%**.

5. **Execution Success Rate ($E_{\text{exec}}$)**:
   $$E_{\text{exec}} = \frac{\text{Successfully Executed Steps}}{\text{Total Approved Steps}} \times 100\%$$
   *Target*: **$\ge 98\%$**.

---

## 🏗️ 6. Implementation Architecture & UI Blueprint

### 6.1 UI Component Architecture (`/src/components/AgenticOrchestrator.tsx`)

The UI interface is organized into 5 interactive sub-tabs:

1. **`Interactive Plan & HITL Gate`**: Natural language input, interactive checkbox tree with risk badges, parametric step editors, and approval controls.
2. **`ReAct & State Graph Trace`**: Visual rendering of the active State Graph Node (`EXPLORING` $\rightarrow$ `SYNTHESIZING` $\rightarrow$ `AWAITING_HILP` $\rightarrow$ `EXECUTING`) and step-by-step `Thought` $\rightarrow$ `Action` $\rightarrow$ `Observation` logs.
3. **`MCP Tool Skill Registry`**: Inspection grid displaying registered MCP skills, API schemas, and risk tiers.
4. **`Long-Term Memory & User Rules Vault`**: Interactive policy editor where users can add, toggle, or delete custom agent constraints.
5. **`Evals & Benchmarks Dashboard`**: Real-time gauge metrics rendering $S_{\text{safe}}$, $P_{\text{plan}}$, $H_{\text{acc}}$, and $E_{\text{exec}}$ history charts.

---

## 📅 7. Verification & Approval Checklist

- [x] State Graph DAG topology defined with explicit node status schema.
- [x] Model Context Protocol (MCP) tool declarations established across Go, Rust, Python ML, and Gemini tools.
- [x] HILP risk tiering (Tier 0, 1, 2) and safety circuit breakers specified.
- [x] Dual-layer memory architecture (Short-Term Scratchpad + Long-Term Policy Vault) designed.
- [x] Quantitative Evals framework formulated with 5 mathematical performance metrics.
- [x] UI component layout defined with 5 interactive sub-tabs in `AgenticOrchestrator.tsx`.

---
*Shift Copy Studio Architecture Board — Next Step: Code Implementation.*
