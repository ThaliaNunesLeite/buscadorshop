const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Servir os arquivos estáticos do front-end (HTML, CSS, JS da página)
app.use(express.static(path.join(__dirname, 'public')));

// Configuração da conexão com o Amazon RDS MySQL
// Substitua pelos dados reais do seu banco na AWS
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'seu-endpoint-do-rds.amazonaws.com',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'sua_senha',
    database: process.env.DB_NAME || 'buscadorshop',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Rota para buscar os produtos do banco de dados RDS
app.get('/api/produtos', async (req, res) => {
    try {
        const { categoria, busca, ranking } = req.query;
        let query = 'SELECT * FROM produtos WHERE 1=1';
        let params = [];

        if (categoria && categoria !== 'todos') {
            query += ' AND categoria = ?';
            params.push(categoria);
        }

        if (busca) {
            query += ' AND nome LIKE ?';
            params.push(`%${busca}%`);
        }

        if (ranking) {
            query += ' AND tipo_ranking = ?';
            params.push(ranking);
        }

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar produtos no RDS:', error);
        res.status(500).json({ error: 'Erro interno ao consultar o banco de dados' });
    }
});

// Iniciar o servidor na porta 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BuscadorShop rodando na porta ${PORT}`);
});