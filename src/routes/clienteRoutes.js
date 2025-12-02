//cria rotas para acesar o controlador
const express = require("express");
const router = express.Router();
const {clienteController} = require("../controller/clienteController.js");

router.get("/clientes", clienteController.listarClientes);
router.put("/clientes/:idCliente", clienteController.atualizarCliente);
router.post("/clientes", clienteController.criarCliente);
router.delete("/clientes/:idCliente", clienteController.deletarCliente);

module.exports = {clienteRoutes: router};