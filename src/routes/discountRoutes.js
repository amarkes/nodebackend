const express = require('express');
const discountController = require('../controllers/discountController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

/**
 * @swagger
 * /discounts/{id}:
 *   get:
 *     tags:
 *       - Discounts
 *     summary: Obter desconto por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do desconto
 *     responses:
 *       200:
 *         description: Desconto retornado com sucesso
 *       404:
 *         description: Desconto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/discounts/:id', auth, isAdmin, discountController.getDiscountById);

/**
 * @swagger
 * /discounts:
 *   get:
 *     tags:
 *       - Discounts
 *     summary: Obter lista de descontos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de descontos
 */
router.get('/discounts', auth, isAdmin, discountController.getAllDiscounts);


/**
 * @swagger
 * /discounts:
 *   post:
 *     tags:
 *       - Discounts
 *     summary: Criar um novo desconto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Discounts'
 *     responses:
 *       201:
 *         description: Desconto criado com sucesso
 */
router.post('/discounts', auth, isAdmin, discountController.createDiscount);

/**
 * @swagger
 * /discounts/{id}:
 *   patch:
 *     tags:
 *       - Discounts
 *     summary: Atualizar desconto existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do desconto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Discounts'
 *     responses:
 *       200:
 *         description: Desconto atualizado com sucesso
 */
router.patch('/discounts/:id', auth, isAdmin, discountController.updateDiscount);

/**
 * @swagger
 * /discounts/{id}:
 *   delete:
 *     tags:
 *       - Discounts
 *     summary: Deletar um desconto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do desconto
 *     responses:
 *       204:
 *         description: Desconto deletado com sucesso
 */
router.delete('/discounts/:id', auth, isAdmin, discountController.deleteDiscount);

module.exports = router;
