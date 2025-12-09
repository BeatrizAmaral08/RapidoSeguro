const { sql, getConnection } = require("../config/RapidoSeguro");

const clienteModel = {

    /**
    * @async
    * @function inserirCliente
    * @description Insere um novo cliente no banco de dados e retorna o seu ID
    * @param {string} nomeCliente - Nome completo do cliente
    * @param {string} cpfCliente - CPF no formato de 000.000.000-00
    * @param {string} telefone - Telefone de contato do cliente
    * @param {string} email - Email do cliente
    * @param {string} endereco - Endereço completo
    * @returns {Promise<object>} Retorna um objeto contendo o idCliente gerado
    * @throws Erro ao inserir cliente no banco de dados
    */

    inserirCliente: async (nomeCliente, cpfCliente, telefone, email, endereco) => {
        try {
            const pool = await getConnection();

            let querysql = `
                INSERT INTO Clientes(nomeCliente, cpfCliente, telefone, email, endereco)
                OUTPUT INSERTED.idCliente
                VALUES(@nomeCliente, @cpfCliente, @telefone, @email, @endereco)
            `;

            const result = await pool.request()
                .input('nomeCliente', sql.VarChar(40), nomeCliente)
                .input('cpfCliente', sql.Char(14), cpfCliente)
                .input('telefone', sql.VarChar(12), telefone)
                .input('email', sql.VarChar(100), email)
                .input('endereco', sql.VarChar(250), endereco)
                .query(querysql);

            return result.recordset[0]; // retorna o ID do cliente

        } catch (error) {
            console.error(`Erro ao inserir cliente`, error);
            throw error;
        }
    },

    /**
     * @async
     * @function buscarCpf
     * @description Busca um cliente pelo CPF
     * @param {string} cpfCliente - CPF a ser pesquisado
     * @returns {Promise<object[]>} Lista contendo o cliente encontrado ou vazia se não existir
     * @throws Erro ao consultar CPF no banco de dados
     */

    buscarCpf: async (cpfCliente) => {
        try {
            const pool = await getConnection();

            let querySQL = "SELECT * FROM Clientes WHERE cpfCliente = @cpfCliente";

            const result = await pool
                .request()
                .input(`cpfCliente`, sql.Char(14), cpfCliente)
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.log(`Erro ao buscar CPF`, error);
            throw error;
        }
    },

     /**
     * @async
     * @function buscarEmail
     * @description Busca um cliente no banco de dados utilizando o e-mail informado
     * @param {string} email - E-mail do cliente a ser consultado no banco
     * @returns {Promise<Array>} Retorna uma lista (array) contendo os clientes encontrados com o e-mail informado
     * @throws {Error} Retorna erro caso ocorra falha na consulta ao banco de dados
     */

    buscarEmail: async (email) => {
        try {
            const pool = await getConnection();
            const querySQL = "SELECT * FROM Clientes WHERE email = @email";

            const result = await pool
                .request()
                .input('email', sql.VarChar(100), email)
                .query(querySQL);

            return result.recordset; // lista de resultados que recebe do banco de dado

        } catch (error) {
            console.log("Erro ao buscar e-mail", error);
            throw error;
        }
    },

    /**
     * @async
     * @function buscarUm
     * @description Busca um cliente pelo ID único
     * @param {string} idCliente - ID do cliente (GUID)
     * @returns {Promise<object[]>} Retorna um array contendo o cliente encontrado
     * @throws Erro ao consultar cliente pelo ID
     */

    buscarUm: async (idCliente) => {
        const pool = await getConnection();
        const result = await pool.request()
            .input('idCliente', sql.UniqueIdentifier, idCliente)
            .query('SELECT * FROM Clientes WHERE idCliente = @idCliente');

        return result.recordset;
    },

    /**
     * @async
     * @function buscarTodos
     * @description Lista todos os clientes cadastrados no banco de dados
     * @returns {Promise<object[]>} Array com todos os clientes
     * @throws Erro ao listar clientes
     */

    buscarTodos: async () => {
        try {
            const pool = await getConnection();

            const querySQL = "SELECT * FROM clientes";

            const result = await pool.request().query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error("Erro ao listar clientes", error);
            throw error;
        }
    },

    /**
     * @async
     * @function atualizarCliente
     * @description Atualiza os dados de um cliente existente
     * @param {string} idCliente - ID do cliente
     * @param {string} nomeCliente - Nome atualizado
     * @param {string} cpfCliente - CPF atualizado
     * @param {string} telefone - Telefone atualizado
     * @param {string} email - Email atualizado
     * @param {string} endereco - Endereço atualizado
     * @returns {Promise<void>}
     * @throws Erro ao atualizar cliente
     */

    atualizarCliente: async (idCliente, nomeCliente, cpfCliente, telefone, email, endereco) => {
        try {
            const pool = await getConnection();

            const querySQL = `
                UPDATE Clientes 
                SET nomeCliente = @nomeCliente,
                    cpfCliente = @cpfCliente,
                    telefone = @telefone,
                    email = @email,
                    endereco = @endereco
                WHERE idCliente = @idCliente
            `;

            await pool.request()
                .input('idCliente', sql.UniqueIdentifier, idCliente)
                .input('nomeCliente', sql.VarChar(12), nomeCliente)
                .input('cpfCliente', sql.Char(14), cpfCliente)
                .input('telefone', sql.VarChar(12), telefone)
                .input('email', sql.Char(100), email)
                .input('endereco', sql.VarChar(250), endereco)
                .query(querySQL);

        } catch (error) {
            console.error("Erro ao atualizar cliente", error);
            throw error;
        }
    },

     /**
     * @async
     * @function existePedidos
     * @description Verifica se um cliente possui pedidos cadastrados no sistema
     * @param {string} idCliente - ID do cliente a ser verificado
     * @returns {Promise<boolean>} Retorna true caso o cliente tenha pelo menos um pedido,
     * ou false caso não possua nenhum
     * @throws {Error} Lança um erro caso ocorra falha ao consultar os pedidos no banco de dados
     */

     //verifica se o cliente tem pedidos
    existePedidos: async (idCliente) => {
        try {
            const pool = await getConnection();

            const result = await pool.request()
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .query(`
                    SELECT COUNT(*) AS total
                    FROM Pedidos
                    WHERE idCliente = @idCliente
                `);

            return result.recordset[0].total > 0;
        } catch (error) {
            console.error("Erro ao verificar pedidos do cliente:", error);
            throw error;
        }
    },

    /**
     * @async
     * @function deletarCliente
     * @description Deleta um cliente do banco de dados
     * @param {string} idCliente - ID do cliente
     * @returns {Promise<void>}
     * @throws Erro ao deletar cliente
     */

    deletarCliente: async (idCliente) => {
        try {
            const pool = await getConnection();

            const querySQL = `DELETE FROM Clientes WHERE idCliente = @idCliente`;

            await pool.request()
                .input('idCliente', sql.UniqueIdentifier, idCliente)
                .query(querySQL);

        } catch (error) {
            console.error("Erro ao deletar cliente", error);
            throw error;
        }
    },

};

module.exports = { clienteModel };

