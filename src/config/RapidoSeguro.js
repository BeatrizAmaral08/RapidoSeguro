const sql = require("mssql");

const config = {
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    server: process.env.SERVER_DB,
    database: "RapidoSeguro",
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function getConnection() {
    try {
        const pool = await sql.connect(config);
        return pool;
    } catch (error) {
        console.error("Erro na conexão com o SQL Server:", error);
        return null; 
    }
}

(async () => {
    const pool = await getConnection();

    if (pool) {
        console.log("Conexão com o banco de dados bem-sucedida!");
    }
})();

module.exports = { sql, getConnection };
