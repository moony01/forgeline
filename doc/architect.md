# 🧠 WebAutoline — System Architecture Overview

WebAutoline is an AI-powered automation platform that transforms a structured design brief into a fully deployed web application using a chain of modular AI tools (MCP Servers).

---

## 🧱 System Layers

[design-brief.json]  
↓  
[prompts/*.prompt.txt]  
↓  
[MCP Servers: Figma → CodeGen → Deploy]  
↓  
[forgeline-app output (SSR or CSR)]  

---

## 📦 Project Structure (Monorepo)

/forgeline/
├── packages/
│ ├── forgeline-app/ # Nuxt3 SSR+CSR output web app
│ ├── forgeline-brief/ # Design brief input UI (CSR)
│ └── forgeline-modules/ # Shared schema, logic, components
├── prompts/ # .prompt.txt instructions for agents
├── doc/ # AI-readable project docs
├── AGENTS.md # Codex CLI agent contract
├── GEMINI.md # Gemini CLI agent contract


---

## 🔗 MCP-Based Automation Flow

1. **Brief Input**  
   - A user fills out a design brief on `forgeline-brief`  
   - `design-brief.json` is stored locally or uploaded to S3

2. **Prompt Generation**  
   - A `.prompt.txt` file is generated in `/prompts/` based on the brief  
   - The prompt includes design/tone/goals/sections in plain language

3. **Agent Triggered**  
   - Gemini/Codex CLI detects the prompt and starts action  
   - Agent reads prompt → optionally uses `doc/` → writes output to `packages/`

4. **MCP Toolchain Activated**  
   - **Figma MCP Server** → Auto-generates design from brief  
   - **CodeGen MCP Server** → Generates Vue/Nuxt components  
   - **Deploy MCP Server** → Deploys the app as CSR or SSR

5. **Deployment Output**  
   - CSR: GitHub Pages or S3 (for landing pages, low-cost)  
   - SSR: AWS SAM + Lambda@Edge (for SEO, e-commerce)

---

## 💡 2-Track Architecture for Web Agency Business

| Track      | Target Project      | Rendering | Deployment         | Cost Level |
|------------|---------------------|-----------|---------------------|------------|
| **CSR**    | Landing pages, Info | CSR/SSG   | GitHub Pages, S3    | Low        |
| **SSR**    | Shopping, Booking   | SSR       | AWS SAM + Lambda    | High       |

The same `forgeline-app` framework supports both tracks using `definePageMeta({ ssr })`.

---

## 🎯 Design Goals

- **Single Source of Truth**: `design-brief.json` becomes the canonical config for the app
- **Modular Automation**: Each tool is an MCP-compliant microservice
- **Prompt-Driven**: No manual command needed – only `.prompt.txt` triggers the flow
- **Scalable**: Ready for multi-client, multi-tenant SaaS use
- **Agent-Compatible**: Designed to work with Gemini/Codex CLI agents

---

## 🧾 Related Documents

- [`mcp-flow.md`](./mcp-flow.md): Protocol for agent-to-tool orchestration  
- [`naming-convention.md`](./naming-convention.md): File, component, schema naming rules  
- [`brief.schema.ts`](../packages/forgeline-modules/brief-core/) — Brief JSON validation
