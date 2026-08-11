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

## 3. Core Architectural Modules

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
