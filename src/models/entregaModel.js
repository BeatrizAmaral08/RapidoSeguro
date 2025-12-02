const { sql, getConnection } = require("../config/RapidoSeguro");

const entregaModel = {

    // Calcula o valor total da entrega 
    calcularValor: ({ valorDistancia, valorPeso, acrescimo, desconto, taxaExtra }) => {
        const valorTotal =
            (valorDistancia + valorPeso + acrescimo + taxaExtra) - desconto;

        return valorTotal;
    },

    // adiciona uma nova entrega no banco de dados
    inserirEntrega: async (
        idPedido,
        valorDistancia,
        valorPeso,
        acrescimo,
        desconto,
        taxaExtra,
        valorFinal,
        statusEntrega
    ) => {
        try {
            const pool = await getConnection();

            const querysql = `
                INSERT INTO Entregas (
                    idPedido,
                    valorDistancia,
                    valorPeso,
                    acrescimo,
                    desconto,
                    taxaExtra,
                    valorFinal,
                    statusEntrega
                ) VALUES (
                    @idPedido,
                    @valorDistancia,
                    @valorPeso,
                    @acrescimo,
                    @desconto,
                    @taxaExtra,
                    @valorFinal,
                    @statusEntrega
                )
            `;

            await pool.request()
                .input('idPedido', sql.UniqueIdentifier, idPedido)
                .input('valorDistancia', sql.Decimal(10, 2), valorDistancia)
                .input('valorPeso', sql.Decimal(10, 2), valorPeso)
                .input('acrescimo', sql.Decimal(10, 2), acrescimo)
                .input('desconto', sql.Decimal(10, 2), desconto)
                .input('taxaExtra', sql.Decimal(10, 2), taxaExtra)
                .input('valorFinal', sql.Decimal(10, 2), valorFinal)
                .input('statusEntrega', sql.VarChar(20), statusEntrega)
                .query(querysql);

        } catch (error) {
            console.error("Erro ao inserir entrega:", error);
            throw error;
        }
    },

    // Busca uma entrega pelo ID
    buscarUmaEntrega: async (idEntrega) => {
        try {
            const pool = await getConnection();

            const querySQL = "SELECT * FROM Entregas WHERE idEntrega = @idEntrega";

            const result = await pool
                .request()
                .input('idEntrega', sql.UniqueIdentifier, idEntrega)
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error("Erro ao buscar entrega:", error);
            throw error;
        }
    },
    // Lista todas as entregas
    buscarTodas: async () => {
        try {
            const pool = await getConnection();

            const querySQL = "SELECT * FROM Entregas";

            const result = await pool.request().query(querySQL);

            return result.recordset; //array com os resultados da consulta

        } catch (error) {
            console.error("Erro ao listar entregas:", error);
            throw error;
        }
    },

    // Calculo completo do custo da entrega
    calcularCustoEntrega: ({
        distanciaKm,
        valorPorKm,
        pesoKg,
        valorPorKg,
        tipoEntrega
    }) => {

        const valorDistancia = distanciaKm * valorPorKm;
        const valorPeso = pesoKg * valorPorKg;

        const valorBase = valorDistancia + valorPeso;

        // adiciona o acrescimo para entregas urgente
        let acrescimo = 0;
        if (tipoEntrega.toLowerCase() === "urgente") {
            acrescimo = valorBase * 0.20;
        }

        let valorFinal = valorBase + acrescimo;

        // Desconto de 10% se passar de 500,00
        let desconto = 0;
        if (valorFinal > 500) {
            desconto = valorFinal * 0.10;
            valorFinal -= desconto;
        }

        //adicioa uma taxa extra se passar de 50kg
        let taxaExtra = 0;
        if (pesoKg > 50) {
            taxaExtra = 15;
            valorFinal += taxaExtra;
        }

        return {
            valorDistancia,
            valorPeso,
            valorBase,
            acrescimo,
            desconto,
            taxaExtra,
            valorFinal
        };
    },

    // atualiza uma entrega existente
    atualizarEntrega: async (
        idEntrega,
        idPedido,
        valorDistancia,
        valorPeso,
        acrescimo,
        desconto,
        taxaExtra,
        valorFinal,
        statusEntrega
    ) => {
        try {
            const pool = await getConnection();

            const querysql = `
            UPDATE Entregas
            SET 
                idPedido = @idPedido,
                valorDistancia = @valorDistancia,
                valorPeso = @valorPeso,
                acrescimo = @acrescimo,
                desconto = @desconto,
                taxaExtra = @taxaExtra,
                valorFinal = @valorFinal,
                statusEntrega = @statusEntrega
            WHERE idEntrega = @idEntrega
        `;

            await pool.request()
                .input("idEntrega", sql.UniqueIdentifier, idEntrega)
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .input("valorDistancia", sql.Decimal(10, 2), valorDistancia)
                .input("valorPeso", sql.Decimal(10, 2), valorPeso)
                .input("acrescimo", sql.Decimal(10, 2), acrescimo)
                .input("desconto", sql.Decimal(10, 2), desconto)
                .input("taxaExtra", sql.Decimal(10, 2), taxaExtra)
                .input("valorFinal", sql.Decimal(10, 2), valorFinal)
                .input("statusEntrega", sql.VarChar(20), statusEntrega)
                .query(querysql);

        } catch (error) {
            console.error("Erro ao atualizar entrega:", error);
            throw error;
        }
    },

    // Deleta uma entrega
    deletarEntrega: async (idEntrega) => {
        try {
            const pool = await getConnection();

            const querySQL = `
            DELETE FROM Entregas
            WHERE idEntrega = @idEntrega
        `;

            await pool.request()
                .input('idEntrega', sql.UniqueIdentifier, idEntrega)
                .query(querySQL);

        } catch (error) {
            console.error("Erro ao deletar entrega:", error);
            throw error;
        }
    }

};
module.exports = { entregaModel };
