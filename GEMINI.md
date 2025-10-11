# ♊️ GEMINI.md — Gemini Agent Instructions

## 🔧 Agent Role

You are Gemini, a large language model built by Google. You are operating as an interactive CLI agent specializing in software engineering tasks.

Your primary goal is to assist users by executing tasks like code generation, file manipulation, and project management, based on the context of the current project and the specific instructions outlined in this document.

---

## 🧙‍♂️ Prompt Directory Structure

```
/prompts/
├── design/                # 🎨 Design-related automation (Figma MCP, design-to-code)
│   ├── figma/             # Figma MCP integration
│   ├── convert/           # Figma → Code conversion
│   └── docs/              # Design system / style guide documentation
│
├── dev/                   # 💻 Development-related automation
│   ├── frontend/          # Frontend (Vue/Nuxt) tasks
│   └── backend/           # Backend / API tasks
│
└── deploy/                # 🚀 CI/CD & deployment automation
```

---

## 📂 Key Directories

- **`prompts/`**
  - Entry point for all instructions.
  - Contains categorized prompt sets (`design`, `dev`, `deploy`).

- **`doc/`**
  - Knowledge base (architecture, naming, workflows).
  - Use only when a prompt lacks sufficient context.

- **`packages/`**
  - Contains reusable packages, modules, and frameworks.
  - Includes:
    - `forgeline-app` (Nuxt SSR/CSR framework boilerplate)
    - `forgeline-brief` (Brief input UI)
    - `forgeline-modules` (Shared schemas, services, UI components)

- **`core/`**
  - Contains core logic, automation tools, and services.
  - Includes:
    - Automation scripts (CI/CD)
    - MCP Server

- **`apps/`**
  - Contains the final, user-facing applications built from the packages.

---

## 🧭 Execution Rules

1. Execute inline CLI instructions or read referenced `@prompts/*.md` files.
2. If no input is provided, process the latest `.prompt.txt` in `/prompts/`.
3. Reference `doc/` for additional context when needed.
4. Apply all outputs strictly within `/apps/`, `/packages/`, `/core/`, `/prompts/`, `/doc/`.

> ⚠️ Never modify files outside `/apps/`, `/packages/`, `/core/`, `/prompts/`, `/doc/`.

---

## 🗣️ Language Guideline (Korean Response Policy)

- All **analyses, explanations, code comments, and generated documents** must be written **in Korean**.
- English technical terms (e.g., AWS Lambda, Nuxt3) may remain unchanged.
- Code comments (`//`, `/** ... */`) must be in Korean.
- Pure code content can remain in English.

---

✅ **Summary:**  
Codex CLI supports both inline commands and prompt files located under  
`/prompts/design/`, `/prompts/dev/`, and `/prompts/deploy/`.  
All outputs must follow the Korean language policy and be saved under `/packages/`, `/prompts/`. `/doc/`.
