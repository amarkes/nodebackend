const { User } = require('../../models');
const { validationResult } = require('express-validator');
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
    res.status(400);
    next(err);
  }
};

exports.updateUserIsStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isStaff } = req.body;

    // Busca o usuário pelo ID
    const user = await findUserById(id);
    console.log(user)
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Atualiza a flag isStaff
    user.isStaff = isStaff;
    await user.save();

    // Prepara a resposta com os dados do usuário
    const userResponse = prepareUserResponse(user);

    res.status(200).json(userResponse);
  } catch (err) {
    res.status(400);
    next(err);
  }
};

exports.updateUserActivate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const user = await findUserById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.active = active;
    await user.save();

    // Prepara a resposta com os dados do usuário
    const userResponse = prepareUserResponse(user);

    res.status(200).json(userResponse);
  } catch (err) {
    res.status(400);
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
        throw new Error('User not found');
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

      res.status(200).json(userResponse);
    } else {
      return res.status(401).json({ message: 'You are not authorized to update this user' });
    }
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: err.message });
    } else {
      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const loggedInUser = req.user;
    console.log(loggedInUser)

    if (loggedInUser.isStaff || loggedInUser._id === parseInt(userId)) {
      // Verifica se o usuário existe
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Deleta o usuário
      await user.destroy();
      return res.status(200).json({ message: 'User deleted successful.' });
    } else {
      return res.status(401).json({ message: 'You are not authorized to delete this user' });
    }


  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};