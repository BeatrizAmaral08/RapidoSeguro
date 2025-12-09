const express = require("express");
const router = express.Router();
const {pedidoController} = require("../controller/pedidoController.js");

/**
 * Rotas relacionadas às entregas
 * @module pedidoRoutes
 * 
 * @description
 * GET /pedidos   - lista todas os pedidos do banco de dados
 * POST /pedidos    - cria um novo pedido
 * DELETE /pedidos/:idPedidos   -  exclui um pedido
 * PUT /pedidos/:idPedido   - atualiza dados dos pedidos
 */

router.get("/pedidos", pedidoController.listarPedidos);
router.post("/pedidos", pedidoController.criarPedido);
router.delete("/pedidos/:idPedido", pedidoController.deletarPedido);
router.put("/pedidos/:idPedido", pedidoController.atualizarPedido);


module.exports = {pedidoRoutes: router};