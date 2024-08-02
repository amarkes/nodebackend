// src/authUserRoutes.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const auth = require('./middleware/auth');
const isAdmin = require('./middleware/isAdmin');

const secret = 'my-secret-key'; // Normalmente, isso estaria em uma variável de ambiente

/**
 * @swagger
 * /api/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registrar um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john_doe@example.com"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *     responses:
 *       201:
 *         description: Usuário criado
 *       400:
 *         description: Requisição inválida
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });

    const token = jwt.sign({ _id: user.id }, secret, { expiresIn: '30d' });

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      isStaff: user.isStaff,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token: token
    };
    res.status(201).send(userResponse);
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      res.status(400);
      next(new Error('Username or email already exists'));
    } else {
      next(err);
    }
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Fazer login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *     responses:
 *       200:
 *         description: Sucesso
 *       400:
 *         description: Requisição inválida
 */
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ username: identifier }, { email: identifier }]
      }
    });
    if (!user || !(await user.validatePassword(password))) {
      res.status(400);
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ _id: user.id }, secret, { expiresIn: '30d' });
    res.header('Authorization', token).send({ token });
  } catch (err) {
    res.status(400);
    next(err);
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obter lista de usuários
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 1
 *                 next:
 *                   type: string
 *                   example: null
 *                 previous:
 *                   type: string
 *                   example: null
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/users', auth, isAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.formatList(users, users.length, null, null);
  } catch (err) {
    res.status(400);
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{id}/staff:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Adicionar ou atualizar usuário como staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isStaff:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       400:
 *         description: Requisição inválida
 *       404:
 *         description: Usuário não encontrado
 */
router.patch('/users/:id/staff', auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isStaff } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.isStaff = isStaff;
    await user.save();

    res.status(200).json({ message: 'User updated', user });
  } catch (err) {
    res.status(400);
    next(err);
  }
});

module.exports = router;
