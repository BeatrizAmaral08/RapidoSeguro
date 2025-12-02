const { entregaModel } = require("../models/entregaModel.js");
const { pedidoModel } = require("../models/pedidoModel.js");

const entregaController = { 
criarEntrega: async (req, res) => {
    try {
        const { 
            idPedido,
            distanciaKm,
            valorPorKm,
            pesoKg,
            valorPorKg,
            tipoEntrega,
            statusEntrega 
        } = req.body;

        if (!idPedido || !distanciaKm || !valorPorKm || !pesoKg || !valorPorKg || !tipoEntrega) {
            return res.status(400).json({ Erro: "Campos obrigatórios não foram preenchidos" });
        }

        if (idPedido.length !== 36) {
            return res.status(400).json({ Erro: "Id do Pedido inválido" });
        }

        const pedido = await pedidoModel.buscarUm(idPedido);
        if (!pedido || pedido.length !== 1) {
            return res.status(400).json({ Erro: "Pedido não encontrado" });
        }

        //includes verifica se um determinado valor existe dentro de um array 
        if (!["normal", "urgente"].includes(tipoEntrega.toLowerCase())) { //toLowerCase torna a palavra em letras minusculas
            return res.status(400).json({ Erro: "Tipo de entrega inválido, use: normal ou urgente" });
        }

        // status de entrega
        const statusPermitidos = ["calculado", "emTransito", "entregue", "cancelado"];

        // valida se o cliente mandou status
        let statusFinal = "calculado"; 

        if (statusEntrega) {
            if (!statusPermitidos.includes(statusEntrega)) {
                return res.status(400).json({ Erro: "Status inválido! Use: calculado, emTransito, entregue ou cancelado" });
            }
            statusFinal = statusEntrega;
        }

        const custos = entregaModel.calcularCustoEntrega({
            distanciaKm,
            valorPorKm,
            pesoKg,
            valorPorKg,
            tipoEntrega
        });

        await entregaModel.inserirEntrega(
            idPedido,
            custos.valorDistancia,
            custos.valorPeso,
            custos.acrescimo,
            custos.desconto,
            custos.taxaExtra,
            custos.valorFinal,
            statusFinal 
        );

        res.status(200).json({
            mensagem: "Entrega cadastrada e calculada com sucesso",
            custos
        });

    } catch (error) {
        console.error("Erro ao cadastrar entrega:", error);
        res.status(500).json({ Erro: "Erro interno no servidor ao cadastrar entrega!" });
    }
},


    buscarEntrega: async (req, res) => {
        try {
            const { idEntrega } = req.params;

            if (idEntrega.length !== 36) {
                return res.status(400).json({ erro: "ID da entrega inválido" });
            }

            const entrega = await entregaModel.buscarUmaEntrega(idEntrega);

            if (!entrega || entrega.length === 0) {
                return res.status(404).json({ erro: "Entrega não encontrada!" });
            }

            return res.status(200).json(entrega);

        } catch (error) {
            console.error("Erro ao buscar entrega:", error);
            res.status(500).json({ erro: "Erro interno ao buscar entrega" });
        }
    },

    listarEntregas: async (req, res) => {
        try {
            const entregas = await entregaModel.buscarTodas();
            return res.status(200).json(entregas);

        } catch (error) {
            console.error("Erro ao listar as entregas:", error);
            res.status(500).json({ erro: "Erro interno ao listar entregas" });
        }
    },

    atualizarEntrega: async (req, res) => {
    try {
        const { idEntrega } = req.params;

        if (!idEntrega || idEntrega.length !== 36) {
            return res.status(400).json({ erro: "ID da entrega inválido" });
        }

        const entregaExistente = await entregaModel.buscarUmaEntrega(idEntrega);
        if (!entregaExistente || entregaExistente.length === 0) {
            return res.status(404).json({ erro: "Entrega não encontrada!" });
        }

        // Campos que podem ser atualizados
        const {
            idPedido,
            distanciaKm,
            valorPorKm,
            pesoKg,
            valorPorKg,
            tipoEntrega,
            statusEntrega
        } = req.body;

        // valida o status da entrega
        const statusPermitidos = ["calculado", "emTransito", "entregue", "cancelado"];

        if (statusEntrega && !statusPermitidos.includes(statusEntrega)) {
            return res.status(400).json({
                erro: "Status inválido! Use: calculado, em_transito, entregue ou cancelado"
            });
        }

        // valido o tipo de entrega // toLowerCase para validar as palavras com letra minuscula
        if (tipoEntrega && !["normal", "urgente"].includes(tipoEntrega.toLowerCase())) {
            return res.status(400).json({
                erro: "Tipo de entrega inválido! Use: normal ou urgente"
            });
        }

        // recalcula os custos se algum dado mudar
        let valorDistancia = entregaExistente[0].valorDistancia;
        let valorPeso = entregaExistente[0].valorPeso;
        let acrescimo = entregaExistente[0].acrescimo;
        let desconto = entregaExistente[0].desconto;
        let taxaExtra = entregaExistente[0].taxaExtra;
        let valorFinal = entregaExistente[0].valorFinal;

        const houveMudancaNosValores =
            distanciaKm || valorPorKm || pesoKg || valorPorKg || tipoEntrega;

        if (houveMudancaNosValores) {
            const novosCustos = entregaModel.calcularCustoEntrega({
                distanciaKm: distanciaKm ?? entregaExistente[0].distanciaKm,
                valorPorKm: valorPorKm ?? entregaExistente[0].valorPorKm,
                pesoKg: pesoKg ?? entregaExistente[0].pesoKg,
                valorPorKg: valorPorKg ?? entregaExistente[0].valorPorKg,
                tipoEntrega: tipoEntrega ?? entregaExistente[0].tipoEntrega
            });

            valorDistancia = novosCustos.valorDistancia;
            valorPeso = novosCustos.valorPeso;
            acrescimo = novosCustos.acrescimo;
            desconto = novosCustos.desconto;
            taxaExtra = novosCustos.taxaExtra;
            valorFinal = novosCustos.valorFinal;
        }

        
        await entregaModel.atualizarEntrega(
            idEntrega,
            idPedido ?? entregaExistente[0].idPedido,
            valorDistancia,
            valorPeso,
            acrescimo,
            desconto,
            taxaExtra,
            valorFinal,
            statusEntrega ?? entregaExistente[0].statusEntrega
        );

        return res.status(200).json({
            mensagem: "Entrega atualizada com sucesso!" });

    } catch (erro) {
        console.error("Erro ao atualizar entrega:", erro);
        return res.status(500).json({ erro: "Erro ao atualizar entrega" });
    }
},

    deletarEntrega: async (req, res) => {
        try {
            const { idEntrega } = req.params;

            if (idEntrega.length !== 36) {
                return res.status(400).json({ erro: "ID da entrega inválido" });
            }

            const entrega = await entregaModel.buscarUmaEntrega(idEntrega);

            if (!entrega || entrega.length !== 1) {
                return res.status(404).json({ erro: "Entrega não encontrada!" });
            }

            await entregaModel.deletarEntrega(idEntrega);

            res.status(200).json({ mensagem: "Entrega deletada com sucesso!" });

        } catch (error) {
            console.error("Erro ao deletar entrega:", error);
            res.status(500).json({ erro: "Erro interno ao deletar entrega" });
        }
    },

}

module.exports = { entregaController };
