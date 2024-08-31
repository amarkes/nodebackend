// config.js
module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'default_secret', // Use o segredo da variável de ambiente ou um padrão
};