const express = require("express");
const app = express();

const { clienteRoutes } = require("./src/routes/clienteRoutes.js");
const { pedidoRoutes } = require("./src/routes/pedidoRoutes.js");
const { entregaRoutes } = require("./src/routes/entregaRoutes.js");

const PORT = 8081;

app.use(express.json());


app.use("/", clienteRoutes);
app.use("/", pedidoRoutes);
app.use("/", entregaRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
