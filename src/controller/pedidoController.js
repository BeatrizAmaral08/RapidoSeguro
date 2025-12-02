const { pedidoModel } = require("../models/pedidoModel.js");
const { clienteModel } = require("../models/clienteModel.js");
const { entregaModel } = require("../models/entregaModel.js");


const pedidoController = {
    /**
     * controlador que lista todos os pedidos do banco de dados
     * 
     * @async
     * @function listarPedidos
     * @param {object} req objeto da requisição (recebido do cliente HTTP)
     * @param {object} res objeto da resposta (enviado ao cliente HTTP)
     * @returns {promise</void>} retorna uma resposta JSON com a lista de produtos
     * @throws mostra no console e retorna erro 500 se ocorrer falha ao buscar os pedidos 
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

            // Verifica campos que são obrigatórios
            if (!idCliente || !dataPedido || !tipoEntrega || !distanciaEntrega || !pesoKg || !valorKm || !valorKg) {
                return res.status(400).json({ erro: "Campos obrigatórios não foram preenchidos!" });
            }

            // Verifica se o cliente existe
            const cliente = await clienteModel.buscarUm(idCliente);
            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "Cliente não encontrado!" });
            }

            // Valida tipo de entrega
            const tiposValidos = ["normal", "urgente"];
            if (!tiposValidos.includes(tipoEntrega)) {
                return res.status(400).json({ erro: "Tipo de entrega inválido! Escolha 'normal' ou 'urgente'." });
            }

            // Calcula o acréscimo de 20% se entrega for urgente
            let acrescimo = 0;
            if (tipoEntrega === "urgente") {
                const valorBase = (distanciaKm * valorPorKm) + (pesoKg * valorPorKg); 
                acrescimo = valorBase * 0.20; 
            }


            // Valida os números do peso e distancia
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

            // Insere os dados no banco
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

            // Retorna o valor total calculado
            res.status(201).json({
                message: "Pedido cadastrado com sucesso!",
                valorTotal
            });

        } catch (error) {
            console.error("Erro ao cadastrar pedido:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao cadastrar pedido." });
        }
    },

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

            //guarda todos os dados atuais do pedido
            const pedidoAtual = pedido[0];

            //o ?? mantém os valores antigos caso algum campo não seja enviado no body
            const idClienteAtualizado = idCliente ?? pedidoAtual.idCliente;
            const dataPedidoAtualizado = dataPedido ?? pedidoAtual.dataPedido;
            const tipoEntregaAtualizado = tipoEntrega ?? pedidoAtual.tipoEntrega;
            const distanciaEntregaAtualizado = distanciaEntrega ?? pedidoAtual.distanciaEntrega;
            const pesoKgAtualizado = pesoKg ?? pedidoAtual.pesoKg;
            const valorKmAtualizado = valorKm ?? pedidoAtual.valorKm;
            const valorKgAtualizado = valorKg ?? pedidoAtual.valorKg;

            //Valida o tipo da entrega caso tenha sido alterado // && verifica se o valor existe e se foi enviado no body da requisição.
            if (tipoEntrega && !["normal", "urgente"].includes(tipoEntrega.toLowerCase())) {
                return res.status(400).json({ erro: "Tipo de entrega inválido! Escolha 'normal' ou 'urgente'." });
            }

            //calcula de novo o valor total caso algum campo que influencia o valor tenha mudado
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
            res.status(200).json({ mensagem: "Pedido atualizado com sucesso!" });

        } catch (error) {
            console.error("Erro ao atualizar pedido:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao atualizar pedido" });
        }
    },

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

            await pedidoModel.deletarPedido(idPedido);
            res.status(200).json({ mensagem: "O pedido foi deletado com sucesso!" });

        } catch (error) {
            console.error("Erro ao deletar pedido:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao deletar pedido!" });
        }
    },
}
module.exports = { pedidoController };