const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../../models');
const Sequelize = require('sequelize');
const { jwtSecret } = require('../config');

exports.generateAffiliateCode = (userId) => {
    const algo = userId % 26;
    const char = String.fromCharCode(65 + algo);
    return `MY${algo}U${char}`;
};

exports.generateUserResponse = (user, token) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    tags: user.tags,
    affiliate: user.affiliate,
    token,
});

exports.prepareUserResponse = (user) => ({
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

exports.findUserByIdentifier = async (identifier) => {
    return await User.findOne({
        where: {
            [Sequelize.Op.or]: [{ username: identifier }, { email: identifier }]
        }
    });
};

exports.verifyPassword = async (inputPassword, userPassword) => {
    return await bcrypt.compare(inputPassword, userPassword);
};

exports.generateToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.JWT_SECRET || jwtSecret, { expiresIn: '30d' });
};

exports.extractTokenFromHeader = (authHeader) => {
    if (!authHeader) {
        throw new Error('Authorization header is required');
    }

    const token = authHeader.split(' ')[1]; // O token vem após 'Bearer'
    if (!token) {
        throw new Error('Token is required');
    }

    return token;
};

exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || jwtSecret);
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
};

exports.findUserById = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: [
            'id', 'username', 'email', 'firstName', 'lastName', 'document',
            'mobile', 'phone', 'gender', 'active', 'roles', 'tags', 'birth',
            'notes', 'affiliate', 'isStaff'
        ]
    });

    if (!user || !user.active) {
        throw new Error('User not found or not active');
    }

    return user;
};
exports.getAllowedUpdates = (updateData, allowedUpdates) => {
    const filteredUpdates = {};
    Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
            filteredUpdates[key] = updateData[key];
        }
    });
    return filteredUpdates;
};