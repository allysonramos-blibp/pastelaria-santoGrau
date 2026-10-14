# 🚀 Guia Completo de Deploy: Vercel + Render + Neon

Este guia passo a passo ensina como subir o **Pastelaria Santo Grau** para a nuvem de forma 100% gratuita usando a stack moderna:
- **Banco de Dados:** Neon (Serverless PostgreSQL)
- **Backend API:** Render (Java Spring Boot 3 + Docker)
- **Frontend PWA:** Vercel (React + Vite)

---

## 🗄️ PARTE 1: Banco de Dados no Neon (PostgreSQL)

1. Acesse **[neon.tech](https://neon.tech)** e faça login com seu GitHub.
2. Clique em **"Create Project"**.
   - **Project Name:** `pastelaria-db`
   - **Postgres version:** `16` (ou 15)
   - Clique em **"Create Project"**.
3. Na tela principal do Dashboard do Neon, você verá a caixa **"Connection Details"**:
   - Selecione a aba **"Connection string"** e marque a opção **"Pooled connection"** (ou Direct).
   - **Sua Connection String do Neon:**
     ```text
     postgresql://neondb_owner:npg_TwvgO8qDR7BL@ep-curly-cloud-b5keor3y-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     ```
4. **Dados já extraídos prontos para o Render:**
   - **Host / Endpoint:** `ep-curly-cloud-b5keor3y-pooler.c-7.us-east-2.aws.neon.tech`
   - **Database Name:** `neondb`
   - **Username:** `neondb_owner`
   - **Password:** `npg_TwvgO8qDR7BL`
   
   *Formato da JDBC URL pronta para o Spring Boot:*
   ```text
   jdbc:postgresql://ep-curly-cloud-b5keor3y-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## ☕ PARTE 2: Backend no Render (Spring Boot)

1. Acesse **[render.com](https://render.com)** e faça login com seu GitHub.
2. Clique em **"New +"** no topo e selecione **"Web Service"**.
3. Escolha **"Build and deploy from a Git repository"** e selecione o repositório:
   - `allysonramos-blibp/pastelaria-santoGrau`
4. Na tela de configuração:
   - **Name:** `pastelaria-backend-api` (ou o nome que preferir)
   - **Region:** Ohio (US East) ou Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `backend-spring-boot`  *(⚠️ IMPORTANTE: digite exatamente isso!)*
   - **Runtime:** `Docker` *(o Render detectará o Dockerfile automaticamente)*
   - **Instance Type:** `Free`
5. Role até a seção **"Environment Variables"** e adicione as seguintes variáveis:

| Key (Chave) | Value (Valor) | Explicação |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `prod` | Ativa o perfil de produção com PostgreSQL |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://ep-curly-cloud-b5keor3y-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require` | A URL JDBC do seu Neon |
| `SPRING_DATASOURCE_USERNAME` | `neondb_owner` | Usuário do banco Neon |
| `SPRING_DATASOURCE_PASSWORD` | `npg_TwvgO8qDR7BL` | Senha do banco Neon |
| `PORT` | `8080` | Porta padrão do container |

6. Clique no botão azul **"Create Web Service"**.
7. O Render começará a compilar com o Maven e em 2 a 3 minutos mostrará `Your service is live 🎉`.
8. Copie a URL pública gerada pelo Render (exemplo: `https://pastelaria-backend-api.onrender.com`).
   - Teste no navegador acessando: `https://pastelaria-backend-api.onrender.com/api/health`
   - Deve retornar: `{"status":"UP","app":"Pastelaria Express API (Spring Boot)"}`.

---

## ⚡ PARTE 3: Frontend na Vercel (React + Vite)

1. Acesse **[vercel.com](https://vercel.com)** e faça login com o GitHub.
2. Clique em **"Add New..."** ➔ **"Project"**.
3. Encontre o repositório `pastelaria-santoGrau` e clique em **"Import"**.
4. Na tela de configuração do projeto:
   - **Framework Preset:** `Vite` (já virá selecionado)
   - **Root Directory:** deixe `./` (a raiz do projeto)
   - **Build and Output Settings:**
     - Build Command: `npm run build`
     - Output Directory: `dist`
5. Abra a seção **"Environment Variables"** e adicione:

| Name (Nome) | Value (Valor) |
| :--- | :--- |
| `VITE_API_URL` | `https://pastelaria-backend-api.onrender.com/api` *(A URL do seu backend no Render + `/api` no final)* |

6. Clique no botão **"Deploy"**.
7. Em menos de 1 minuto, a Vercel gerará o link oficial do seu app (exemplo: `https://pastelaria-santograu.vercel.app`).

---

## ✅ Pronto! Tudo Conectado:
- O cliente acessa pelo link da Vercel ou QR Code.
- O cardápio consome a API REST no Render.
- Todos os pedidos e produtos ficam gravados de forma persistente no Neon PostgreSQL.
- O Dono acessa o Painel da Gerência com JWT e controla a cozinha em tempo real!
