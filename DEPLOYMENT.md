# 🚀 Guia de Deploy: Render + Neon PostgreSQL + Vercel

Este guia ensina como colocar o **Pastelaria Santo Grau** no ar com sincronização em nuvem e PWA no celular:
- **Banco de Dados:** Neon (PostgreSQL Serverless)
- **Servidor & API:** Render (Node.js Express nativo)
- **PWA / Frontend:** Integrado no mesmo servidor ou no Vercel

---

## 🔒 PARTE 1: Banco de Dados Neon (PostgreSQL)

1. Acesse **[neon.tech](https://neon.tech)** e entre na sua conta.
2. No seu projeto, localize a seção **"Connection string"** no dashboard.
3. Se você recebeu o alerta de segurança do Neon:
   - Vá na aba **Roles / Users** do projeto no Neon.
   - Clique em **"Reset password"** para gerar uma nova senha segura.
4. Copie a Connection String (formato `postgresql://...`). Guarde-a para usar no Render.

> ⚠️ **IMPORTANTE DE SEGURANÇA:** Nunca cole a senha do banco diretamente no código do GitHub. Utilize sempre as **Environment Variables (Variáveis de Ambiente)** do painel do Render!

---

## ⚡ PARTE 2: Publicar no Render

1. No **[render.com](https://render.com)**, clique em **"New +"** > **"Web Service"**.
2. Conecte seu repositório GitHub.
3. Configure:
   - **Name:** `pastelaria-santo-grau`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Em **Environment Variables (Variáveis de Ambiente)**, clique em **"Add Environment Variable"** e adicione:
   - **Key:** `DATABASE_URL`
   - **Value:** Cole aqui a sua nova connection string do Neon (`postgresql://neondb_owner:NOVA_SENHA@ep-...neon.tech/neondb?sslmode=require`)
   - **Key:** `NODE_ENV`
   - **Value:** `production`
5. Clique em **"Create Web Service"** (ou Deploy).
6. O Render subirá o servidor Node.js com o cardápio, pedidos e sincronização com o Neon de forma 100% segura e encriptada!
