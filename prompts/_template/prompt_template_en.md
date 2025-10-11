# 🧠 Prompt Template (English Version)

## 🗂️ Task Overview

This prompt instructs the Codex or Gemini CLI agent to automate a specific task (design, development, or deployment).

All generated outputs must follow these principles:

- Follow naming rules from `doc/naming-convention.md`
- Apply Korean comment policy from `AGENTS.md`
- Execute step-by-step according to the MCP workflow standard

---

## 🪜 Step-by-Step Instructions

### Step 1 — Task Definition

- Task Type: (e.g., Frontend component generation, Backend API creation)
- Target Directory: (e.g., forgeline-app/components/)
- Objective: (e.g., Create a user profile card component)

---

### Step 2 — Structure Design

- Define file types required (`.vue`, `.ts`, `.json`, `.md`, etc.)
- Describe structure of components, templates, scripts, or styles
- Provide layout or data structure examples when needed

---

### Step 3 — Functional Logic

- Define required props / data models
- Specify functions, events, or interfaces
- Define user interactions and error handling logic

---

### Step 4 — Code Standards & Comment Policy

- All comments must be written in Korean
- Follow PascalCase, camelCase, or project naming standards
- Apply TailwindCSS or shared style conventions

---

### Step 5 — Output Results

- Specify file path for generated or modified files
- Define success message (e.g., ✅ File successfully created)
- Include optional validation or post-check instructions

---

## ⚠️ Notes

- Do not modify unrelated files
- Do not import undefined external dependencies
- Maintain UTF-8 encoding and ensure SSR rendering compatibility

---

✅ **Summary:**
This template serves as the standard structure for all automation prompt files under `/prompts`.
Codex and Gemini agents must interpret and execute each instruction step-by-step in sequential order.
