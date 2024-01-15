// File to handle database connection
const mysql = require('mysql12')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'web-agent',
    password: 'Mymotto!s22characters',
    database: 'bookstore_schema',
});

module.exports = db;