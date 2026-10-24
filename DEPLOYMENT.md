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
3. Configure os campos no Render:
   - **Name:** `pastelaria-santo-grau`
   - **Root Directory:** *(Deixe totalmente em branco ou vazio)* ⚠️ **Não digite `backend-spring-boot` aqui! Os arquivos estão na raiz do projeto.**
   - **Environment / Runtime:** `Node`
   - **Build Command:** `npm install --legacy-peer-deps && npm run build`
   - **Start Command:** `npm start`
4. Em **Environment Variables (Variáveis de Ambiente)**, adicione:
   - **Key:** `DATABASE_URL`
   - **Value:** Sua connection string do Neon (`postgresql://...`)
   - **Key:** `NODE_ENV`
   - **Value:** `production`
5. Clique em **"Save Changes"** (ou crie o serviço) e depois em **"Manual Deploy" > "Deploy latest commit"**.
6. O Render subirá o servidor Node.js com o cardápio, pedidos e sincronização com o Neon!
