//cria rotas para acesar o controlador
const express = require("express");
const router = express.Router();
const {clienteController} = require("../controller/clienteController.js");

/**
 * Rotas relacionadas a clientes
 * @module clienteRoutes
 * 
 * @description
 * - GET /clientes -> Listar todos os clientes e suas informações
 * -PUT /clientes/idClientes -> Atualizar informações do cliente
 * - POST/clientes -> Criar um novo cliente
 * -DELETE /clientes/idClientes -> Deletar um cliente, o identificando pelo ID
 */

router.get("/clientes", clienteController.listarClientes);
router.put("/clientes/:idCliente", clienteController.atualizarCliente);
router.post("/clientes", clienteController.criarCliente);
router.delete("/clientes/:idCliente", clienteController.deletarCliente);

module.exports = {clienteRoutes: router};