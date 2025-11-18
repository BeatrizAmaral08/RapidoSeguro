const sql = require("mssql")
const config = {
    user: `PedroPonciano_SQLLogin_1`,
    password: ``,
    server: `localhost`,
    database: `RapidoSeguro`,
    opitions: {
        encrypt: true,
        TrustServerCertificate: true
    }
}
async function getConnection() {
    try {
        const pool = await sql.connect(config);
        return pool; //conjunto de recursos que ficam prontos para serem usados
    } catch (error) {
        console.error('erro na conecção do sql server', error);
    }
}

module.exports={sql, getConnection};