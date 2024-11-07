const { User } = require('../../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const { findUserById, prepareUserResponse, getAllowedUpdates } = require('../middleware/userHelper');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query; // Parâmetros de paginação
    const offset = (page - 1) * limit; // Calcula o deslocamento com base na página atual

    // Busca usuários com paginação
    const { rows: users, count } = await User.findAndCountAll({
      attributes: [
        'id', 'username', 'email', 'firstName', 'lastName', 'document',
        'mobile', 'phone', 'gender', 'active', 'roles', 'tags', 'birth',
        'notes', 'affiliate', 'isStaff'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    // Calcula se há uma próxima página
    const hasNextPage = offset + users.length < count;
    res.formatList(users, count, parseInt(page), Math.ceil(count / limit), hasNextPage);
  } catch (err) {
      next(err);
  }
};

exports.updateUserIsStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isStaff } = req.body;

    // Busca o usuário pelo ID
    const user = await findUserById(id);
    if (!user) {
      const error = {
        statusCode: 404,
        errors: [{user: 'User not found'}]
      }
      next(error);
      return;
    }

    // Atualiza a flag isStaff
    user.isStaff = isStaff;
    await user.save();

    // Prepara a resposta com os dados do usuário
    const userResponse = prepareUserResponse(user);

    const successResponse = {
      statusCode: 200,
      message: 'Operation completed successfully',
      data: userResponse
    };
    next(successResponse)
  } catch (err) {
    next(err);
  }
};

exports.updateUserActivate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const user = await findUserById(id);

    if (!user) {
      const error = {
        statusCode: 404,
        errors: [{user: 'User not found'}]
      }
      next(error);
      return;
    }

    user.active = active;
    await user.save();

    // Prepara a resposta com os dados do usuário
    const userResponse = prepareUserResponse(user);

    const successResponse = {
      statusCode: 200,
      message: 'Operation completed successfully',
      data: userResponse
    };
    next(successResponse)
  } catch (err) {
    next(err);
  }
}

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar se há erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = {
        statusCode: 400,
        errors: errors.array()
      }
      next(error);
      return;
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
      'notes',
    ];

    // Filtrar os campos permitidos para atualização
    const filteredUpdates = getAllowedUpdates(updateData, allowedUpdates);

    // Obtenha o usuário logado a partir do middleware de autenticação
    const loggedInUser = req.user;
    // Verifique se o usuário é staff ou está tentando atualizar seu próprio perfil
    if (loggedInUser.isStaff || loggedInUser._id === parseInt(id)) {
      // Buscar o usuário pelo ID
      const user = await User.findByPk(id);
      if (!user) {
        const error = {
          statusCode: 404,
          errors: [{user: 'User not found'}]
        }
        next(error);
        return;
      }

      // Atualiza apenas os campos permitidos
      await user.update(filteredUpdates);

      // Prepara a resposta do usuário
      const userResponse = {
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
      };
      const successResponse = {
        statusCode: 200,
        message: 'Operation completed successfully',
        data: userResponse
      };
    } else {
      const error = {
        statusCode: 401,
        errors: [{message: 'You are not authorized to update this user'}]
      }
      next(error);
      return;
    }
  } catch (err) {
    if (err.message === 'User not found') {
      const error = {
        statusCode: 404,
        errors: [{message: err.message}]
      }
      next(error);
      return;
    } else {
      next(err);
    }
  }
};


exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const loggedInUser = req.user;

    if (loggedInUser.isStaff || loggedInUser._id === parseInt(userId)) {
      // Verifica se o usuário existe
      const user = await User.findByPk(userId);
      if (!user) {
        const error = {
          statusCode: 404,
          errors: [{user: 'User not found'}]
        }
        next(error);
        return;
      }

      // Deleta o usuário
      await user.destroy();
      const successResponse = {
        statusCode: 204,
        message: 'User deleted successful.',
      };
      next(successResponse)
    } else {
      const error = {
        statusCode: 401,
        errors: [{message: 'You are not authorized to delete this user'}]
      }
      next(error);
      return;
    }


  } catch (error) {
    next(error);
  }
};

exports.updateUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      const error = {
        statusCode: 404,
        errors: [{user: 'Password is required'}]
      }
      next(error);
      return;
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Encontrar o usuário e atualizar a senha
    const user = await User.findByPk(id);
    if (!user) {
      const error2 = {
        statusCode: 404,
        errors: [{user: 'User not found'}]
      }
      next(error2);
    }

    user.password = hashedPassword;
    await user.save();

    const successResponse = {
      statusCode: 200,
      message: 'Password updated successful.',
    };
    next(successResponse)
  } catch (error) {
    next(error);
  }
};
