//cria rotas para acesar o controlador
const express = require("express");
const router = express.Router();
const { entregaController } = require("../controller/entregaController.js");

/**
 * Rotas relacionadas às entregas
 * @module entregaRoutes
 * 
 * @description
 * GET /entregas   - lista todas as entregas do banco de dados
 * GET /entregas/:idEntrega   - busca uma entrega específica
 * POST /entregas    - cria uma nova entrega
 * PUT /entregas/:idEntrega   - atualiza dados ou status de uma entrega
 * DELETE /entregas/:idEntrega   -  exclui uma entrega
 */

router.get("/entregas", entregaController.listarEntregas);

router.get("/entregas/:idEntrega", entregaController.buscarEntrega); 

router.post("/entregas", entregaController.criarEntrega);

router.put("/entregas/:idEntrega", entregaController.atualizarEntrega);

router.delete("/entregas/:idEntrega", entregaController.deletarEntrega);

module.exports = { entregaRoutes: router };