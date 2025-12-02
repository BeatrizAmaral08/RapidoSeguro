const { sql, getConnection } = require("../config/RapidoSeguro");

const clienteModel = {

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
buscarUm: async (idCliente) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('idCliente', sql.UniqueIdentifier, idCliente)
        .query('SELECT * FROM Clientes WHERE idCliente = @idCliente');

    return result.recordset; 
},

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
