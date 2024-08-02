// src/protectedRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');

/**
 * @swagger
 * /api/protected:
 *   get:
 *     tags:
 *       - Protected
 *     summary: Rota protegida
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/protected', auth, (req, res) => {
  res.send('This is a protected route');
});

module.exports = router;
