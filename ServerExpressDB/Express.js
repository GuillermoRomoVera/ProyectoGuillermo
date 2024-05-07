const express = require('express');
const mysql = require('mysql2/promise');
const morgan = require('morgan');
const app = express();
// Create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'datos',
});

app.get('/usuario', async (req, res, next) => {  
    let sql = '';
    if (typeof req.query.idUsuario == 'undefined') {
        sql = "SELECT * FROM usuario ";
    } else {
        sql = `SELECT * FROM usuario WHERE idUsuario = ${req.query.idUsuario}`; 
    }

    try {
        console.log(req.query.idUsuario);
        const connection = await mysql.createConnection({
            host: 'localhost', user: 'root', database: 'datos',
        });
        var [rows, fields] = await connection.query(sql); 
        if (rows.length > 0) {
            res.send(rows); // Cambiado de 'row' a 'rows'
        } else {
            res.status(404).json({ Error: "Datos no encontrados" });
        }
    } catch (err) {
        res.send(err.code + '/' + err.message);
    }
});

app.listen(8080, () => {
    console.log('Example app listening on port 8080!');
});
