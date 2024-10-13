const { User } = require('../../models');
const Sequelize = require('sequelize');
const { validationResult } = require('express-validator');
const { generateAffiliateCode, generateUserResponse,
  findUserByIdentifier, verifyPassword, generateToken,
  extractTokenFromHeader, verifyToken, findUserById } = require('../middleware/userHelper');

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
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
    console.log(password)
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
    const token = generateToken(user)
    let userResponse = generateUserResponse(user, token);
    const successResponse = {
      statusCode: 201,
      message: 'Operation completed successfully',
      data: userResponse
    };
    next(successResponse);
    // res.status(201).send(userResponse);
  } catch (err) {
    console.log(err)
    if (err instanceof Sequelize.UniqueConstraintError) {
      const error = {
        statusCode: 400,
        errors: ['Username or email already exists']
      }
      next(error);
      return;
    } else {
      console.log(err);
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
      const error = {
        statusCode: 400,
        errors: [{credentials: 'Invalid credentials or user not active'}]
      }
      next(error);
      return;
      // return res.status(400).json({ message: 'Invalid credentials or user not active' });
    }

    // Verifica se a senha está correta
    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      const error = {
        statusCode: 400,
        errors: [{credentials: 'Invalid credentials'}]
      }
      next(error);
      return;
      // return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Gera o token JWT
    const token = generateToken(user);

    // Envia o token no cabeçalho e no corpo da resposta
    res.header('Authorization', token).send({ token, user });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    // Extrai o token do cabeçalho de autorização
    const token = extractTokenFromHeader(req.header('Authorization'))
    if (!token) {
      const error = {
        statusCode: 401,
        errors: [{token: 'Token is missing'}]
      }
      next(error);
      return;
    };
    // Verifica e decodifica o token
    const decoded = verifyToken(token);
    if (!decoded || !decoded._id) {
      const error = {
        statusCode: 401,
        errors: [{token: 'Invalid token'}]
      }
      next(error);
      return;
    }
    // Busca o usuário correspondente ao ID do token
    const user = await findUserById(decoded._id);
    if (!user) {
      const error = {
        statusCode: 404,
        errors: [{user: 'User not found'}]
      };
      next(error);
      return;
    }
    // Gera um novo token
    const newToken = generateToken(user);
    // Retorna o novo token
    res.json({ token: newToken });
  } catch (err) {
    next(err);
  }
};

exports.meUser = async (req, res, next) => {
  try {
    // Extrai o token do cabeçalho de autorização
    const token = extractTokenFromHeader(req.header('Authorization'));

    if (!token) {
      const error = {
        statusCode: 401,
        errors: [{user: 'Token is missing'}]
      }
      next(error);
      return;
    }

    // Verifica e decodifica o token
    const decoded = verifyToken(token);

    if (!decoded || !decoded._id) {
      const error = {
        statusCode: 401,
        errors: [{token: 'Invalid token'}]
      }
      next(error);
      return;
    }

    // Busca o usuário correspondente ao ID do token
    const user = await findUserById(decoded._id);

    if (!user) {
      const error = {
        statusCode: 404,
        errors: [{user: 'User not found'}]
      }
      next(error);
      return;
    }
    const successResponse = {
      statusCode: 200,
      message: 'Operation completed successfully',
      data: user
    };
    next(successResponse);

  } catch (err) {
    next(err); // Envia o erro para o middleware de erros
  }
};