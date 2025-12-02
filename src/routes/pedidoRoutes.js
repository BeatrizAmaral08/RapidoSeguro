const express = require("express");
const router = express.Router();
const {pedidoController} = require("../controller/pedidoController.js");

/**
 * define as rotas relacionadas aos pedidos 
 *  
 * @module pedidoRoutes
 * 
 * @description
 * GET /pedidos > lista todos os pedidos do banco de dados 
 */

router.get("/pedidos", pedidoController.listarPedidos);
router.post("/pedidos", pedidoController.criarPedido);
router.delete("/pedidos/:idPedido", pedidoController.deletarPedido);
router.put("/pedidos/:idPedido", pedidoController.atualizarPedido);


module.exports = {pedidoRoutes: router};