const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../../models');
const Sequelize = require('sequelize');

exports.generateAffiliateCode = (userId) => {
    const algo = userId % 26;
    const char = String.fromCharCode(65 + algo);
    return `${process.env.AFFILIATECODE}${algo}U${char}`;
};
exports.generateJWTData = (user) => {
    if (!user || !user.id) {
        return;
    }
    return {
        _id: user.id,
        _username: user.username,
        _email: user.email,
        _firstName: user.firstName,
        _lastName: user.lastName,
        _document: user.document,
        _mobile: user.mobile,
        _phone: user.phone,
        _gender: user.gender,
        _active: user.active,
        _roles: user.roles,
        _tags: user.tags,
        _birth: user.birth,
        _notes: user.notes
    }
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

exports.generateToken = (user) => {
    return jwt.sign(this.generateJWTData(user), process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.extractTokenFromHeader = (authHeader) => {
    if (!authHeader) {
        return;
    }

    const token = authHeader.split(' ')[1]; // O token vem após 'Bearer'
    if (!token) {
        return;
    }

    return token;
};

exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return;
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
        return;
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