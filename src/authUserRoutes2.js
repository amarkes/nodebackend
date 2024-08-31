// src/authUserRoutes.js

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const auth = require('./middleware/auth');
const isAdmin = require('./middleware/isAdmin');

const { check, validationResult } = require('express-validator');

const { jwtSecret } = require('../src/config');

// Função para gerar o código de afiliado
const generateAffiliateCode = (userId) => {
  const algo = userId % 26;
  const char = String.fromCharCode(65 + algo);
  return `MY${algo}U${char}`;
};

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
 *               - firstName
 *               - lastName
 *             properties:
 *               username:
 *                 type: string
 *                 example: ""
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ""
 *               password:
 *                 type: string
 *                 example: ""
 *               firstName:
 *                 type: string
 *                 example: ""
 *               lastName:
 *                 type: string
 *                 example: ""
 *               document:
 *                 type: string
 *                 example: ""
 *               mobile:
 *                 type: string
 *                 example: ""
 *               phone:
 *                 type: string
 *                 example: ""
 *               gender:
 *                 type: string
 *                 enum: [ "M", "F", "U" ]
 *                 example: "U"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: []
 *               birth:
 *                 type: string
 *                 format: date
 *                 example: ""
 *               notes:
 *                 type: string
 *                 example: ""
 *     responses:
 *       201:
 *         description: Usuário criado
 *       400:
 *         description: Requisição inválida
 */
router.post(
  '/register',
  [
    check('username').notEmpty().withMessage('Username is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 4 }).withMessage('Password must be at least 6 characters long'),
    check('firstName').notEmpty().withMessage('First name is required'),
    check('lastName').notEmpty().withMessage('Last name is required'),
    check('document').optional().isString().withMessage('Document must be a valid string'),
    check('mobile').optional().isMobilePhone().withMessage('Mobile number must be valid'),
    check('phone').optional().isString().withMessage('Phone number must be valid'),
    check('gender').optional().isIn(['M', 'F', 'U']).withMessage('Gender must be M, F, or U'),
    check('birth').optional().isDate().withMessage('Birth must be a valid date'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        username,
        email,
        password,
        firstName,
        lastName,
        document,
        mobile,
        phone,
        gender,
        active = true,
        roles = [],
        tags = [],
        birth,
        notes,
      } = req.body;

      // Criando o usuário
      let user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        document,
        mobile,
        phone,
        gender,
        active,
        roles,
        tags,
        birth,
        notes,
      });

      // Gerar o código de afiliado agora que o usuário foi criado e tem um ID
      const affiliateCode = generateAffiliateCode(user.id);
      user = await user.update({ affiliate: affiliateCode });

      const token = jwt.sign({ _id: user.id }, jwtSecret, { expiresIn: '30d' });

      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isStaff: user.isStaff,
        active: user.active,
        roles: user.roles,
        tags: user.tags,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        affiliate: user.affiliate,
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
  }
);


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
 *         description: Token gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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

    if (!user || !user.active) {  // Verifica se o usuário existe e está ativo
      return res.status(400).json({ message: 'Invalid credentials or user not active' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET || jwtSecret, { expiresIn: '30d' });

    res.header('Authorization', token).send({ token });
  } catch (err) {
    next(err);
  }
});


// Definição do esquema Swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do usuário
 *           example: ""
 *         username:
 *           type: string
 *           description: Nome de usuário
 *           example: ""
 *         email:
 *           type: string
 *           description: Endereço de e-mail do usuário
 *           example: ""
 *         password:
 *           type: string
 *           description: Senha do usuário (criptografada)
 *           example: ""
 *         firstName:
 *           type: string
 *           description: Primeiro nome do usuário
 *           example: ""
 *         lastName:
 *           type: string
 *           description: Sobrenome do usuário
 *           example: ""
 *         document:
 *           type: string
 *           description: Documento de identificação do usuário
 *           example: ""
 *         mobile:
 *           type: string
 *           description: Número de celular do usuário
 *           example: ""
 *         phone:
 *           type: string
 *           description: Número de telefone fixo do usuário
 *           example: ""
 *         gender:
 *           type: string
 *           enum: [ "M", "F", "U" ]
 *           description: Gênero do usuário
 *           example: "U"
 *         active:
 *           type: boolean
 *           description: Status ativo do usuário
 *           example: true
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           description: Grupos de acesso do usuário
 *           example: []
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associadas ao usuário
 *           example: []
 *         birth:
 *           type: string
 *           format: date
 *           description: Data de nascimento do usuário
 *           example: ""
 *         notes:
 *           type: string
 *           description: Anotações adicionais sobre o usuário
 *           example: ""
 *         affiliate:
 *           type: string
 *           description: Código de afiliado do usuário gera automatico
 *           example: ""
 *         isStaff:
 *           type: boolean
 *           description: Indica se o usuário é membro da equipe
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do usuário
 *           example: "2023-01-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização do usuário
 *           example: "2023-01-02T12:00:00Z"
 */

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
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'document', 'mobile', 'phone', 'gender', 'active', 'roles', 'tags', 'birth', 'notes', 'affiliate', 'isStaff']
    });
    res.formatList(users, users.length, null, null);
  } catch (err) {
    res.status(400);
    next(err);
  }
});

/**
 * @swagger
 * /api/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obter informações do usuário logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Não autorizado
 */
router.get('/me', async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded._id, {
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'document', 'mobile', 'phone', 'gender', 'active', 'roles', 'tags', 'birth', 'notes', 'affiliate', 'isStaff']
    });

    if (!user || !user.active) {  // Verifica se o usuário existe e está ativo
      return res.status(401).json({ message: 'Invalid token or user not active' });
    }

    res.send(user);
  } catch (err) {
    res.status(401);
    next(err);
  }
});


/**
 * @swagger
 * /api/users/{id}/staff:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Atualizar usuário como staff, apenas staff tem acesso
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
 *       401:
 *         description: Acesso negado
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

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      document: user.document,
      mobile: user.mobile,
      phone: user.phone,
      gender: user.gender,
      active: user.active,
      roles: user.roles,
      tags: user.tags,
      birth: user.birth,
      notes: user.notes,
      affiliate: user.affiliate,
      isStaff: user.isStaff,
    });
  } catch (err) {
    res.status(400);
    next(err);
  }
});

/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Ativa e desativa o usuario
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
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */
router.patch('/users/:id/activate', auth, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.active = active;
    await user.save();

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      document: user.document,
      mobile: user.mobile,
      phone: user.phone,
      gender: user.gender,
      active: user.active,
      roles: user.roles,
      tags: user.tags,
      birth: user.birth,
      notes: user.notes,
      affiliate: user.affiliate,
      isStaff: user.isStaff,
    });
  } catch (err) {
    res.status(400);
    next(err);
  }
});

/**
 * @swagger
 * /api/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh do token JWT para o usuário logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Novo token gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Novo token JWT
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Token inválido ou expirado
 */


/**
 * @swagger
 * /api/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh do token JWT para o usuário logado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Novo token gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Novo token JWT
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Token inválido ou expirado
 */
router.post('/refresh-token', async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is required' });
  }

  const token = authHeader.split(' ')[1]; // O token vem após 'Bearer'

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  try {
    // Verifica o token e decodifica
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Busca o usuário correspondente ao token
    const user = await User.findByPk(decoded._id, {
      attributes: ['id', 'username', 'email', 'isStaff']
    });

    if (!user || !user.active) {  // Verifica se o usuário existe e está ativo
      return res.status(401).json({ message: 'Invalid token or user not active' });
    }

    // Gere um novo token para o usuário logado
    const newToken = jwt.sign({ _id: user.id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '30d' });

    res.json({ token: newToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Atualizar parcialmente um usuário
 *     description: Atualiza campos específicos de um usuário. Apenas usuários com função de staff podem atualizar qualquer usuário. Usuários comuns só podem atualizar seu próprio perfil.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário a ser atualizado
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: ""
 *               lastName:
 *                 type: string
 *                 example: ""
 *               document:
 *                 type: string
 *                 example: ""
 *               mobile:
 *                 type: string
 *                 example: ""
 *               phone:
 *                 type: string
 *                 example: ""
 *               gender:
 *                 type: string
 *                 enum: [ "M", "F", "U" ]
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               birth:
 *                 type: string
 *                 format: date
 *                 example: ""
 *               notes:
 *                 type: string
 *                 example: ""
 *               affiliate:
 *                 type: string
 *                 example: ""
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno no servidor
 */
router.patch('/users/:id',
  auth,
  [
    check('firstName').optional().notEmpty().withMessage('First name is required'),
    check('lastName').optional().notEmpty().withMessage('Last name is required'),
    check('document').optional().isString().withMessage('Document must be a valid string'),
    check('mobile').optional().isMobilePhone().withMessage('Mobile number must be valid'),
    check('phone').optional().isString().withMessage('Phone number must be valid'),
    check('gender').optional().isIn(['M', 'F', 'U']).withMessage('Gender must be M, F, or U'),
    check('birth').optional().isDate().withMessage('Birth must be a valid date'),
  ],
  async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se há erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Defina os campos que podem ser alterados
    const allowedUpdates = [
      'firstName',
      'lastName',
      'document',
      'mobile',
      'phone',
      'birth',
      'gender',
      'roles',
      'tags',
      'notes'
    ];
    // Filtrar somente os campos permitidos
    const filteredUpdates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updateData[key];
      }
    });

    try {
      // Obtenha o usuário logado a partir do middleware de autenticação
      const loggedInUser = req.user;
      console.log(loggedInUser)
      // Verifique se o usuário é staff ou está tentando atualizar seu próprio perfil
      if (loggedInUser.isStaff || loggedInUser._id === parseInt(id)) {
        const user = await User.findByPk(id);

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Atualiza apenas os campos permitidos
        await user.update(filteredUpdates);

        res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          document: user.document,
          mobile: user.mobile,
          phone: user.phone,
          gender: user.gender,
          active: user.active,
          roles: user.roles,
          tags: user.tags,
          birth: user.birth,
          notes: user.notes,
          affiliate: user.affiliate,
          isStaff: user.isStaff,
        });
      } else {
        return res.status(401).json({ message: 'You are not authorized to update this user' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
