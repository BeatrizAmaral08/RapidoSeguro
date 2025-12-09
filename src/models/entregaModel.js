const { sql, getConnection } = require("../config/RapidoSeguro");

const entregaModel = {

    /**
     * @function calcularValor
     * @description Calcula o valor total da entrega somando distância, peso, acréscimos e taxa extra, e subtraindo descontos
     * @param {Object} valores - Conjunto de valores usados no cálculo
     * @param {number} valores.valorDistancia - Valor calculado com base na distância percorrida
     * @param {number} valores.valorPeso - Valor calculado com base no peso da carga
     * @param {number} valores.acrescimo - Acréscimo adicional aplicado
     * @param {number} valores.desconto - Desconto aplicado ao valor total
     * @param {number} valores.taxaExtra - Taxa adicional para casos específicos
     * @returns {number} Retorna o valor total final da entrega
     */

    // Calcula o valor total da entrega 
    calcularValor: ({ valorDistancia, valorPeso, acrescimo, desconto, taxaExtra }) => {
        const valorTotal =
            (valorDistancia + valorPeso + acrescimo + taxaExtra) - desconto;

        return valorTotal;
    },

    /**
     * @function inserirEntrega
     * @async
     * @description Adiciona uma nova entrega no banco de dados
     * @param {string} idPedido - ID do pedido vinculado à entrega
     * @param {number} valorDistancia - Valor calculado pela distância
     * @param {number} valorPeso - Valor calculado pelo peso
     * @param {number} acrescimo - Acréscimo aplicado (ex.: entrega urgente)
     * @param {number} desconto - Desconto aplicado
     * @param {number} taxaExtra - Taxa extra (ex.: peso acima de 50kg)
     * @param {number} valorFinal - Valor final da entrega após os cálculos
     * @param {string} statusEntrega - Status da entrega (ex.: "pendente")
     */

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

    /**
     * @function buscarUmaEntrega
     * @async
     * @description Busca uma entrega específica pelo ID
     * @param {string} idEntrega - ID da entrega desejada
     * @returns {Promise<Array>} Retorna um array contendo os dados da entrega encontrada
     */

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

    
    /**
     * @function buscarTodas
     * @async
     * @description Lista todas as entregas cadastradas no banco
     * @returns {Promise<Array>} Um array contendo todas as entregas registradas
     */

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

     /**
     * @function calcularCustoEntrega
     * @description Realiza o cálculo completo do custo da entrega considerando distância, peso, urgência, descontos e taxa extra
     * @param {Object} dados
     * @param {number} dados.distanciaKm - Distância percorrida (Km)
     * @param {number} dados.valorPorKm - Valor cobrado por Km
     * @param {number} dados.pesoKg - Peso da carga
     * @param {number} dados.valorPorKg - Valor cobrado por Kg
     * @param {string} dados.tipoEntrega - Tipo da entrega: "normal" ou "urgente"
     * @returns {Object} Objeto contendo todos os valores calculados
     */

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

     /**
     * @function atualizarEntrega
     * @async
     * @description Atualiza os dados de uma entrega existente no banco
     * @param {string} idEntrega - ID da entrega
     * @param {string} idPedido - ID do pedido vinculado
     * @param {number} valorDistancia
     * @param {number} valorPeso
     * @param {number} acrescimo
     * @param {number} desconto
     * @param {number} taxaExtra
     * @param {number} valorFinal
     * @param {string} statusEntrega - Status atualizado da entrega
     */

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

    /**
     * @async
     * @function atualizarEntregaPorPedido
     * @description Atualiza os dados de entrega vinculados a um pedido específico e recalcula o valor total
     * com base na distância, peso e valores unitários.
     * @param {string} idPedido - ID do pedido ao qual a entrega está vinculada.
     * @param {string} tipoEntrega - Tipo da entrega (ex.: "normal" ou "urgente").
     * @param {number} distanciaEntrega - Distância da entrega em quilômetros.
     * @param {number} pesoKg - Peso da entrega em quilogramas.
     * @param {number} valorKm - Valor cobrado por quilômetro.
     * @param {number} valorKg - Valor cobrado por quilograma.
     * @returns {Promise<Object>} Retorna o resultado da operação de atualização no banco de dados.
     * @throws {Error} Lança um erro caso ocorra falha durante a atualização da entrega.
     */
    
    atualizarEntregaPorPedido: async (
    idPedido,
    tipoEntrega,
    distanciaEntrega,
    pesoKg,
    valorKm,
    valorKg
) => {
    const pool = await getConnection();

    //recalcular o valor total baseado no pedido atualizado
    const valorTotal = (distanciaEntrega * valorKm) + (pesoKg * valorKg);

    const resultado = await pool.request()
        .input("idPedido", sql.Char(36), idPedido)
        .input("tipoEntrega", sql.VarChar(20), tipoEntrega)
        .input("distanciaEntrega", sql.Float, distanciaEntrega)
        .input("pesoKg", sql.Float, pesoKg)
        .input("valorKm", sql.Float, valorKm)
        .input("valorKg", sql.Float, valorKg)
        .input("valorTotal", sql.Float, valorTotal)
        .query(`
            UPDATE entrega
            SET tipoEntrega = @tipoEntrega,
                distanciaEntrega = @distanciaEntrega,
                pesoKg = @pesoKg,
                valorKm = @valorKm,
                valorKg = @valorKg,
                valorTotal = @valorTotal
            WHERE idPedido = @idPedido
        `);

    return resultado;
},


    /**
     * @function deletarEntrega
     * @async
     * @description Deleta uma entrega com base no ID informado
     * @param {string} idEntrega - ID da entrega que será removida
     */

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
