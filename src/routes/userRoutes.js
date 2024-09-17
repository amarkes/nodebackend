const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const verifyTokenAndPermission = require('../middleware/authRoles');
const { updateValidation } = require('../middleware/validation');

const router = express.Router();

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
 *                 current:
 *                   type: string
 *                   example: null
 *                 totalPage:
 *                   type: string
 *                   example: null
 *                 hasNextPage:
 *                   type: boolean
 *                   example: null
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/users', auth, isAdmin, userController.getAllUsers);
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
router.patch('/users/:id/staff', auth, isAdmin, userController.updateUserIsStaff);

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
router.patch('/users/:id/activate', auth, isAdmin, userController.updateUserActivate);

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
 *            $ref: '#/components/schemas/UserUpdate'
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
router.patch('/users/:id', auth, updateValidation, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Deleta o usuário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário deletado
 *       400:
 *         description: Requisição inválida
 *       401:
 *         description: Acesso negado
 *       404:
 *         description: Usuário não encontrado
 */


// router.delete('/users/:id', auth, isAdmin, verifyTokenAndPermission('delete_user'), userController.deleteUser);
router.delete('/users/:id', auth, userController.deleteUser);

module.exports = router;

// verifyTokenAndPermission('create_user')