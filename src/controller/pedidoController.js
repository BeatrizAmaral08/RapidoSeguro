const { pedidoModel } = require("../models/pedidoModel.js");
const { clienteModel } = require("../models/clienteModel.js");
const { entregaModel } = require("../models/entregaModel.js");


const pedidoController = {

    /**
     * @async
     * @function criarPedido
     * @description Cria um novo pedido no sistema após validar cliente, dados enviados e calcular o valor total
     * @param {object} req - Requisição HTTP recebida do cliente
     * @param {object} res - Resposta HTTP enviada pelo servidor
     * @returns {Promise<void>} Retorna mensagem de sucesso e valor total calculado
     * @throws Retorna status 400 para erros de validação e 500 para falhas internas
     */

    criarPedido: async (req, res) => {
        try {
            const {
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaEntrega,
                pesoKg,
                valorKm,
                valorKg
            } = req.body;

            // Verifica campos obrigatórios
            if (!idCliente || !dataPedido || !tipoEntrega || !distanciaEntrega || !pesoKg || !valorKm || !valorKg) {
                return res.status(400).json({ erro: "Campos obrigatórios não foram preenchidos!" });
            }

            // Verifica se o cliente existe
            const cliente = await clienteModel.buscarUm(idCliente);
            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "Cliente não encontrado!" });
            }

            // Validação do tipo
            const tiposValidos = ["normal", "urgente"];
            if (!tiposValidos.includes(tipoEntrega)) {
                return res.status(400).json({ erro: "Tipo de entrega inválido! Escolha 'normal' ou 'urgente'." });
            }

            // Valida números
            if (isNaN(distanciaEntrega) || distanciaEntrega <= 0) {
                return res.status(400).json({ erro: "Distância inválida." });
            }
            if (isNaN(pesoKg) || pesoKg <= 0) {
                return res.status(400).json({ erro: "Peso inválido." });
            }
            if (isNaN(valorKm) || valorKm <= 0) {
                return res.status(400).json({ erro: "Valor por km inválido." });
            }
            if (isNaN(valorKg) || valorKg <= 0) {
                return res.status(400).json({ erro: "Valor por kg inválido." });
            }

            // Calcula valor total
            const valorTotal = (distanciaEntrega * valorKm) + (pesoKg * valorKg);

            // Agora o model já insere pedido + entrega usando transaction
            await pedidoModel.inserirPedido(
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaEntrega,
                pesoKg,
                valorKm,
                valorKg,
                valorTotal
            );

            return res.status(200).json({
                mensagem: "Pedido e entrega cadastrados com sucesso!",
                valorTotal
            });

        } catch (error) {
            console.error("Erro ao criar pedido:", error);
            return res.status(500).json({ erro: "Erro interno ao criar pedido." });
        }
    },

    /**
     * @async
     * @function listarPedidos
     * @description Lista todos os pedidos cadastrados no banco de dados
     * @param {object} req - Objeto da requisição
     * @param {object} res - Objeto da resposta
     * @returns {Promise<void>} Retorna um array com todos os pedidos
     * @throws Retorna erro 500 caso haja falha ao buscar pedidos
     */

    // lista todos os pedidos existentes
    listarPedidos: async (req, res) => {
        try {
            const pedidos = await pedidoModel.buscarTodos();

            res.status(200).json(pedidos);
        } catch (error) {
            console.error("Erro ao listar pedido", error);
            res.status(500).json({ erro: "Erro interno no servidor ao listar pedidos" });
        }
    },

    /**
    * @async
    * @function atualizarPedido
    * @description Atualiza um pedido existente, realizando validações e recalculando o valor total quando necessário
    * @param {object} req - Requisição contendo params e body
    * @param {object} res - Resposta enviada ao cliente
    * @returns {Promise<void>} Retorna mensagem de sucesso ao atualizar pedido
    * @throws Retorna erros 400, 404 ou 500 dependendo do cenário
    */

    atualizarPedido: async (req, res) => {
        try {
            const { idPedido } = req.params;
            const { idCliente, dataPedido, tipoEntrega, distanciaEntrega, pesoKg, valorKm, valorKg } = req.body;

            // Verifica se o ID do pedido é valido
            if (idPedido.length != 36) {
                return res.status(400).json({ erro: "ID do pedido inválido" });
            }

            // Busca o pedido existente no banco de dados
            const pedido = await pedidoModel.buscarUm(idPedido);

            if (!pedido || pedido.length !== 1) {
                return res.status(400).json({ erro: "Pedido não encontrado!" });
            }

            // Se foi enviado um ID, verifica se ele é válido e existe
            if (idCliente) {
                if (idCliente.length != 36) {
                    return res.status(400).json({ erro: "ID do cliente inválido" });
                }

                const cliente = await clienteModel.buscarUm(idCliente);

                if (!cliente || cliente.length !== 1) {
                    return res.status(404).json({ erro: "Cliente não encontrado!" });
                }
            }

            // guarda todos os dados atuais do pedido
            const pedidoAtual = pedido[0];

            // o ?? mantém os valores antigos caso algum campo não seja enviado no body
            const idClienteAtualizado = idCliente ?? pedidoAtual.idCliente;
            const dataPedidoAtualizado = dataPedido ?? pedidoAtual.dataPedido;
            const tipoEntregaAtualizado = tipoEntrega ?? pedidoAtual.tipoEntrega;
            const distanciaEntregaAtualizado = distanciaEntrega ?? pedidoAtual.distanciaEntrega;
            const pesoKgAtualizado = pesoKg ?? pedidoAtual.pesoKg;
            const valorKmAtualizado = valorKm ?? pedidoAtual.valorKm;
            const valorKgAtualizado = valorKg ?? pedidoAtual.valorKg;

            // Valida o tipo da entrega caso tenha sido alterado
            if (tipoEntrega && !["normal", "urgente"].includes(tipoEntrega.toLowerCase())) {
                return res.status(400).json({ erro: "Tipo de entrega inválido! Escolha 'normal' ou 'urgente'." });
            }

            // calcula de novo o valor total caso algum campo que influencia o valor tenha mudado
            const valorTotalAtualizado =
                (distanciaEntregaAtualizado * valorKmAtualizado) +
                (pesoKgAtualizado * valorKgAtualizado);

            // chama o model para atualizar o pedido
            await pedidoModel.atualizarPedido(
                idPedido,
                idClienteAtualizado,
                dataPedidoAtualizado,
                tipoEntregaAtualizado,
                distanciaEntregaAtualizado,
                pesoKgAtualizado,
                valorKmAtualizado,
                valorKgAtualizado,
                valorTotalAtualizado
            );

            // atualiza a entrega relacionada ao pedido
            await entregaModel.atualizarEntregaPorPedido(
                idPedido,
                tipoEntregaAtualizado,
                distanciaEntregaAtualizado,
                pesoKgAtualizado,
                valorKmAtualizado,
                valorKgAtualizado
            );

            return res.status(200).json({
                mensagem: "Pedido e entrega atualizados com sucesso!"
            });

        } catch (error) {
            console.error("Erro ao atualizar pedido:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao atualizar pedido" });
        }
    },

    /**
     * @async
     * @function deletarPedido
     * @description Deleta um pedido existente no sistema após validar seu ID
     * @param {object} req - Requisição contendo o ID do pedido
     * @param {object} res - Resposta enviada ao usuário
     * @returns {Promise<void>} Retorna mensagem de confirmação
     * @throws Retorna erro 400, 404 ou 500
     */

    deletarPedido: async (req, res) => {
        try {
            const { idPedido } = req.params;

            // Verifica se o ID do pedido é válido
            if (idPedido.length != 36) {
                return res.status(400).json({ erro: "ID do pedido inválido!" });
            }

            //verifica se o pedido existe no banco de dados
            const pedido = await pedidoModel.buscarUm(idPedido);

            if (!pedido || pedido.length !== 1) {
                return res.status(400).json({ erro: "Pedido não foi encontrado!" });
            }

           const possuiEntrega = await pedidoModel.temEntrega(idPedido);

        if (possuiEntrega) {
            return res.status(400).json({
                erro: "Não é possível deletar um pedido que possui entrega cadastrada."
            });
        }
        
        await pedidoModel.deletarPedido(idPedido);
        
        return res.status(200).json({ mensagem: "Pedido deletado com sucesso!" });

        } catch (error) {
            console.error("Erro ao deletar pedido:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao deletar pedido!" });
        }
    },
}
module.exports = { pedidoController };