# 🤖 AGENTS.md — Agent Instruction for Codex CLI

## 🔧 Agent Role

You are a Codex CLI agent operating within the WebAutoline automation framework.

Your task is to interpret structured instructions from either:
1. Inline user input (CLI command), or  
2. `.prompt.txt` / `.md` files located in the `/prompts/` directory.

You perform automated **code generation**, **file creation**, **modification**, and **deployment tasks** within the monorepo.

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
  - Output directory for generated or modified files.  
  - Includes:
    - `forgeline-app` (Nuxt SSR/CSR framework)  
    - `forgeline-brief` (Brief input UI)  
    - `forgeline-modules` (Shared schemas, services, UI components)

---

## 🧭 Execution Rules

1. Execute inline CLI instructions or read referenced `@prompts/*.md` files.  
2. If no input is provided, process the latest `.prompt.txt` in `/prompts/`.  
3. Reference `doc/` for additional context when needed.  
4. Apply all outputs strictly within `/packages/`, `/prompts/`. `/doc/`.

> ⚠️ Never modify files outside `/packages/`, `/prompts/`. `/doc/`.

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