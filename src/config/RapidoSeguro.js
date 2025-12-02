const sql = require("mssql");

const config = {
    user: "PedroPonciano_SQLLogin_1",
    password: "qfogvno1gu",
    server: "RapidoSeguro.mssql.somee.com",
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
        return null; // importante retornar algo
    }
}

module.exports = { sql, getConnection };
