const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../../models');
const Sequelize = require('sequelize');
const { jwtSecret } = require('../config');
const { validationResult } = require('express-validator');
const { generateAffiliateCode, generateUserResponse,
  findUserByIdentifier, verifyPassword, generateToken,
  extractTokenFromHeader, verifyToken, findUserById } = require('../middleware/userHelper');

exports.register = async (req, res, next) => {
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
    const userResponse = generateUserResponse(user, token);

    res.status(201).send(userResponse);
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      res.status(400);
      next(new Error('Username or email already exists'));
    } else {
      next(err);
    }
  }
};


exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // Busca o usuário pelo identificador (username ou email)
    const user = await findUserByIdentifier(identifier);

    if (!user || !user.active) {
      return res.status(400).json({ message: 'Invalid credentials or user not active' });
    }

    // Verifica se a senha está correta
    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Gera o token JWT
    const token = generateToken(user.id);

    // Envia o token no cabeçalho e no corpo da resposta
    res.header('Authorization', token).send({ token });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    // Extrai o token do cabeçalho de autorização
    const token = extractTokenFromHeader(req.header('Authorization'));
    // Verifica e decodifica o token
    const decoded = verifyToken(token);
    // Busca o usuário correspondente ao ID do token
    const user = await findUserById(decoded._id);
    // Gera um novo token
    const newToken = generateToken(user.id);
    // Retorna o novo token
    res.json({ token: newToken });
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: err.message });
  }
};

exports.meUser = async (req, res, next) => {
  try {
    // Extrai o token do cabeçalho de autorização
    const token = extractTokenFromHeader(req.header('Authorization'));

    // Verifica e decodifica o token
    const decoded = verifyToken(token);

    // Busca o usuário correspondente ao ID do token
    const user = await findUserById(decoded._id);

    // Retorna os dados do usuário
    res.send(user);
  } catch (err) {
    res.status(401).json({ message: err.message });
    next(err);
  }
}