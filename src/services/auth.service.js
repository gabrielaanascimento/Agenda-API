import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

function generateToken(user) {
  return jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: '7d',
    }
  );
}

export const authService = {
  async register({ nome, email, senha, telefone }) {
    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (userExists) {
      throw new AppError('Este e-mail já está cadastrado.', 409);
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    // Define automaticamente como SUPER_ADMIN apenas se bater com o OWNER_EMAIL do .env
    const isOwner =
      process.env.OWNER_EMAIL &&
      normalizedEmail === process.env.OWNER_EMAIL.toLowerCase().trim();

    const user = await prisma.user.create({
      data: {
        nome,
        email: normalizedEmail,
        senhaHash,
        telefone,
        role: isOwner ? 'SUPER_ADMIN' : 'ALUNO',
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken(user);
    return { user, token };
  },

  async login({ email, senha }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    const passwordMatch = await bcrypt.compare(senha, user.senhaHash);

    if (!passwordMatch) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    const token = generateToken(user);

    const { senhaHash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    return user;
  },

  async updateProfile(userId, { nome, telefone, senhaAtual, novaSenha }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const dataToUpdate = {};
    if (nome) dataToUpdate.nome = nome;
    if (telefone) dataToUpdate.telefone = telefone;

    if (novaSenha) {
      if (!senhaAtual) {
        throw new AppError('Informe a senha atual para definir uma nova senha.', 400);
      }
      const isValid = await bcrypt.compare(senhaAtual, user.senhaHash);
      if (!isValid) {
        throw new AppError('Senha atual incorreta.', 401);
      }
      dataToUpdate.senhaHash = await bcrypt.hash(novaSenha, 10);
    }

    return prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        role: true,
      },
    });
  },
};
