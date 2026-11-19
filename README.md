# Agenda Acadêmica API

API REST desenvolvida com **Node.js**, **Express**, **Prisma ORM**, **bcrypt** e **JWT** para gerenciamento colaborativo de atividades acadêmicas por matéria com sistema de convites e níveis de acesso (`ALUNO`, `ADM`, `SUPER_ADMIN`).

## Instalação e Execução

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` e preencha suas credenciais do PostgreSQL e o seu e-mail em `OWNER_EMAIL`:
   ```bash
   cp .env.example .env
   ```

3. Execute as migrations do Prisma para criar as tabelas no banco de dados:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
