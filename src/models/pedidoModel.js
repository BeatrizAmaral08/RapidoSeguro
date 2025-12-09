const { sql, getConnection } = require("../config/RapidoSeguro");

const pedidoModel = {

    /**
     * Insere um novo pedido no banco de dados e cria automaticamente a entrega
     * @function inserirPedido
     * @async
     * @param {string} idCliente - ID do cliente relacionado ao pedido
     * @param {Date} dataPedido - Data em que o pedido foi realizado
     * @param {string} tipoEntrega - Tipo de entrega (ex: "normal", "urgente")
     * @param {number} distanciaEntrega - Distância da entrega em KM
     * @param {number} pesoKg - Peso da entrega em KG
     * @param {number} valorKm - Valor cobrado por KM
     * @param {number} valorKg - Valor cobrado por KG
     * @param {number} valorTotal - Valor total calculado do pedido
     * @throws {Error} Caso aconteça algum problema ao inserir no banco
     */

    inserirPedido: async (
        idCliente,
        dataPedido,
        tipoEntrega,
        distanciaEntrega,
        pesoKg,
        valorKm,
        valorKg,
        valorTotal
    ) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);

        try {
            //Inicia a transaction
            await transaction.begin();

            const request = new sql.Request(transaction);

            //insere o pedido
            const result = await request
                .input('idCliente', sql.UniqueIdentifier, idCliente)
                .input('dataPedido', sql.DateTime, dataPedido)
                .input('tipoEntrega', sql.VarChar(50), tipoEntrega)
                .input('distanciaEntrega', sql.Decimal(10, 2), distanciaEntrega)
                .input('pesoKg', sql.Decimal(10, 2), pesoKg)
                .input('valorKm', sql.Decimal(10, 2), valorKm)
                .input('valorKg', sql.Decimal(10, 2), valorKg)
                .input('valorTotal', sql.Float, valorTotal)
                .query(`
                INSERT INTO pedidos
                (idCliente, dataPedido, tipoEntrega, distanciaEntrega, pesoKg, valorKm, valorKg, valorTotal)
                OUTPUT INSERTED.idPedido
                VALUES
                (@idCliente, @dataPedido, @tipoEntrega, @distanciaEntrega, @pesoKg, @valorKm, @valorKg, @valorTotal);
            `);

            const idPedidoGerado = result.recordset[0].idPedido;

            // Insere a entrega automática
            await request
                .input("idPedido", sql.Int, idPedidoGerado)
                .input("tipoEntrega", sql.VarChar(50), tipoEntrega)
                .input("status", sql.VarChar(50), "pendente")
                .query(`
                INSERT INTO entregas (idPedido, tipoEntrega, status)
                VALUES (@idPedido, @tipoEntrega, @status);
            `);

            await transaction.commit();

            return { idPedidoGerado };
        } catch (error) {
            await transaction.rollback();
            console.error("Erro ao inserir pedido + entrega no banco:", error);
            throw error;
        }
    },



    /**
     * Busca um pedido específico pelo ID
     * @function buscarUm
     * @async
     * @param {string} idPedido - ID do pedido que será buscado
     * @returns {Promise<Object[]>} Registro retornado do banco
     * @throws {Error} Caso aconteça algum problema ao buscar no banco
     */

    buscarUm: async (idPedido) => {
        try {

            const pool = await getConnection();

            const querySQL = "SELECT * FROM Pedidos WHERE idPedido = @idPedido";

            const result = await pool.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL);

            return result.recordset;
        } catch (error) {
            console.error("Erro ao buscar o pedido", error);
            throw error;
        }
    },

    /**
     * @async
     * @function temEntrega
     * @description Verifica se um determinado pedido possui uma entrega cadastrada.
     * @param {string} idPedido - ID do pedido que será verificado.
     * @returns {Promise<boolean>} Retorna true caso exista uma entrega vinculada ao pedido,
     * ou false caso não exista.
     * @throws {Error} Lança um erro caso ocorra falha na consulta ao banco de dados.
     */

    temEntrega: async (idPedido) => {
    const pool = await getConnection();

    const result = await pool.request()
        .input("idPedido", sql.UniqueIdentifier, idPedido)
        .query(`
           SELECT COUNT(*) AS total
           FROM Entregas
           WHERE idPedido = @idPedido
        `);

    return result.recordset[0].total > 0;
},


    /**
     * Lista todos os pedidos cadastrados no banco
     * @function buscarTodos
     * @async
     * @returns {Promise<Object[]>} Lista completa de pedidos
     * @throws {Error} Caso aconteça algum problema ao listar os pedidos
     */

    buscarTodos: async () => {
        try {
            const pool = await getConnection();

            const querySQL = `
                SELECT 
                    PD.idPedido,
                    CL.nomeCliente,
                    PD.dataPedido,
                    PD.tipoEntrega,
                    PD.distanciaEntrega,
                    PD.pesoKg,
                    PD.valorKm,
                    PD.valorKg,
                    PD.valorTotal
                FROM Pedidos PD
                INNER JOIN Clientes CL
                    ON CL.idCliente = PD.idCliente
            `;

            const result = await pool.request().query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
            throw error;
        }
    },

    /**
     * Atualiza um pedido existente e sua entrega
     * @function atualizarPedido
     * @async
     * @param {string} idPedido - ID do pedido a ser atualizado
     * @param {string} idCliente - Novo ID do cliente
     * @param {Date} dataPedido - Nova data do pedido
     * @param {string} tipoEntrega - Novo tipo de entrega
     * @param {number} distanciaEntrega - Nova distância em KM
     * @param {number} pesoKg - Novo peso em KG
     * @param {number} valorKm - Novo valor por KM
     * @param {number} valorKg - Novo valor por KG
     * @param {number} valorTotal - Novo valor total calculado
     * @throws {Error} Caso aconteça algum problema ao atualizar
     */
    atualizarPedido: async (
        idPedido,
        idCliente,
        dataPedido,
        tipoEntrega,
        distanciaEntrega,
        pesoKg,
        valorKm,
        valorKg,
        valorTotal,
        entregaData
    ) => {

        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            const request = new sql.Request(transaction);

            //atualiza o pedido
            const queryPedido = `
            UPDATE Pedidos
            SET 
                idCliente = @idCliente,
                dataPedido = @dataPedido,
                tipoEntrega = @tipoEntrega,
                distanciaEntrega = @distanciaEntrega,
                pesoKg = @pesoKg,
                valorKm = @valorKm,
                valorKg = @valorKg,
                valorTotal = @valorTotal
            WHERE idPedido = @idPedido
        `;

            await request
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .input("dataPedido", sql.DateTime, dataPedido)
                .input("tipoEntrega", sql.VarChar(50), tipoEntrega)
                .input("distanciaEntrega", sql.Decimal(10, 2), distanciaEntrega)
                .input("pesoKg", sql.Decimal(10, 2), pesoKg)
                .input("valorKm", sql.Decimal(10, 2), valorKm)
                .input("valorKg", sql.Decimal(10, 2), valorKg)
                .input("valorTotal", sql.Decimal(10, 2), valorTotal)
                .query(queryPedido);


            //Atualiza a entrega vinculada ao pedido
            const queryEntrega = `
            UPDATE Entregas
            SET
                valorDistancia = @valorDistancia,
                valorPeso = @valorPeso,
                acrescimo = @acrescimo,
                desconto = @desconto,
                taxaExtra = @taxaExtra,
                valorFinal = @valorFinal,
                statusEntrega = @statusEntrega
            WHERE idPedido = @idPedido
        `;

            await request
                .input("valorDistancia", sql.Decimal(10, 2), entregaData.valorDistancia)
                .input("valorPeso", sql.Decimal(10, 2), entregaData.valorPeso)
                .input("acrescimo", sql.Decimal(10, 2), entregaData.acrescimo)
                .input("desconto", sql.Decimal(10, 2), entregaData.desconto)
                .input("taxaExtra", sql.Decimal(10, 2), entregaData.taxaExtra)
                .input("valorFinal", sql.Decimal(10, 2), entregaData.valorFinal)
                .input("statusEntrega", sql.VarChar(20), entregaData.statusEntrega)
                .query(queryEntrega);

            await transaction.commit();

            return { sucesso: true, mensagem: "Pedido e entrega atualizados com sucesso." };

        } catch (error) {
            await transaction.rollback();
            console.error("Erro ao atualizar pedido + entrega:", error);
            throw error;
        }
    },

    /**
 * Cria um pedido e automaticamente cria sua entrega relacionada usando transação
 * @function criarPedidoEEntrega
 * @async
 * @param {Object} pedidoData - Dados do pedido
 * @param {string} pedidoData.idCliente - ID do cliente
 * @param {Date} pedidoData.dataPedido - Data do pedido
 * @param {string} pedidoData.tipoEntrega - Tipo de entrega (normal/urgente)
 * @param {number} pedidoData.distanciaEntrega - Distância em KM
 * @param {number} pedidoData.pesoKg - Peso em KG
 * @param {number} pedidoData.valorKm - Valor por KM
 * @param {number} pedidoData.valorKg - Valor por KG
 * @param {number} pedidoData.valorTotal - Valor total calculado
 * @param {Object} entregaData - Dados da entrega associada
 * @param {string} entregaData.statusEntrega - Status inicial da entrega
 * @param {string} entregaData.enderecoEntrega - Endereço da entrega
 * @returns {Promise<Object>} Informações sobre o pedido criado
 * @throws {Error} Caso aconteça algum problema durante a transação
 */

    criarPedidoEEntrega: async (pedidoData, entregaData) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            const request = new sql.Request(transaction);

            //  Insere o pedido e guarda o id gerado
            const queryPedido = `
                INSERT INTO Pedidos 
                (idCliente, dataPedido, tipoEntrega, distanciaEntrega, pesoKg, valorKm, valorKg, valorTotal)
                OUTPUT INSERTED.idPedido
                VALUES 
                (@idCliente, @dataPedido, @tipoEntrega, @distanciaEntrega, @pesoKg, @valorKm, @valorKg, @valorTotal)
            `;

            const pedidoInserido = await request
                .input("idCliente", sql.UniqueIdentifier, pedidoData.idCliente)
                .input("dataPedido", sql.DateTime, pedidoData.dataPedido)
                .input("tipoEntrega", sql.VarChar(50), pedidoData.tipoEntrega)
                .input("distanciaEntrega", sql.Decimal(10, 2), pedidoData.distanciaEntrega)
                .input("pesoKg", sql.Decimal(10, 2), pedidoData.pesoKg)
                .input("valorKm", sql.Decimal(10, 2), pedidoData.valorKm)
                .input("valorKg", sql.Decimal(10, 2), pedidoData.valorKg)
                .input("valorTotal", sql.Decimal(10, 2), pedidoData.valorTotal)
                .query(queryPedido);

            const idPedidoCriado = pedidoInserido.recordset[0].idPedido;

            // insere  a entrega automáticamente
            const queryEntrega = `
                INSERT INTO Entregas (idPedido, statusEntrega, enderecoEntrega)
                VALUES (@idPedido, @statusEntrega, @enderecoEntrega)
            `;

            await request
                .input("idPedido", sql.UniqueIdentifier, idPedidoCriado)
                .input("statusEntrega", sql.VarChar(20), entregaData.statusEntrega)
                .input("enderecoEntrega", sql.VarChar(250), entregaData.enderecoEntrega)
                .query(queryEntrega);

            await transaction.commit();

            return {
                sucesso: true,
                mensagem: "Pedido e entrega criados com sucesso.",
                idPedido: idPedidoCriado
            };

        } catch (error) {
            await transaction.rollback();
            console.error("Erro ao criar pedido + entrega:", error);
            throw error;
        }
    },

    /**
     * Deleta um pedido do banco usando transação
     * @function deletarPedido
     * @async
     * @param {string} idPedido - ID do pedido a ser deletado
     * @throws {Error} Caso aconteça algum problema ao deletar
     */

    deletarPedido: async (idPedido) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool); // conjunto de conexões 
        await transaction.begin(); // inicio de um bloco de codigo

        try {
            const querySQL = `
                DELETE FROM Pedidos
                WHERE idPedido = @idPedido
            `;

            await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL);

            await transaction.commit();
        } catch (error) {
            await transaction.rollback(); //reverte uma operação para o estado anterior
            console.error("Erro ao deletar pedido:", error);
            throw error;
        }
    },

}
module.exports = { pedidoModel };