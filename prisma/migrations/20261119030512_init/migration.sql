-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ALUNO', 'ADM', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PROVA', 'TRABALHO', 'LISTA', 'SEMINARIO', 'OUTRO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ALUNO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo_disciplina" TEXT,
    "semestre" TEXT NOT NULL,
    "cor_hex" TEXT NOT NULL DEFAULT '#3B82F6',
    "codigo_convite" TEXT NOT NULL,
    "criado_por_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "entrou_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "ActivityType" NOT NULL DEFAULT 'TRABALHO',
    "data_entrega" TIMESTAMP(3) NOT NULL,
    "link_apoio" TEXT,
    "criado_por_id" TEXT NOT NULL,
    "atualizado_por_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_completions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "concluida_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_codigo_convite_key" ON "subjects"("codigo_convite");

-- CreateIndex
CREATE UNIQUE INDEX "subject_members_user_id_subject_id_key" ON "subject_members"("user_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_completions_user_id_activity_id_key" ON "activity_completions"("user_id", "activity_id");

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_members" ADD CONSTRAINT "subject_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_members" ADD CONSTRAINT "subject_members_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_completions" ADD CONSTRAINT "activity_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_completions" ADD CONSTRAINT "activity_completions_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
