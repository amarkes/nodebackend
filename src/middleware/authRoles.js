
const jwt = require('jsonwebtoken');

function verifyTokenAndPermission(permission) {
    return function (req, res, next) {
        const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

        if (!token) {
            return res.status(403).json({
                message: 'Not token'
            });
        }

        // Verificar o token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: 'Invalid token'
                });
            }

            // Verificar se o usuário tem a permissão necessária
            if (decoded._roles && decoded._roles.includes(permission)) {
                req.user = decoded;  // Armazena as informações do usuário no request
                next();  // Usuário autorizado
            } else {
                return res.status(403).json({
                    message: 'Access Denied'
                });
            }
        });
    };
}

module.exports = verifyTokenAndPermission;