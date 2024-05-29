const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const app = express();
const cors = require('cors');
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const swaggerUI = require('swagger-ui-express');
const swaggerjsDoc = require('swagger-jsdoc');
const multer = require('multer');
const bodyParser = require('body-parser');

app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const folder = path.join(__dirname + '/archivos/');
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, folder) },
    filename: function (req, file, cb) { cb(null, file.originalname) }
});
const upload = multer({ storage: storage });
app.use(upload.single('archivo'));

const PORT = process.env.PORT || 3002;
const PORTE = process.env.MYSQLPORT || 3306;
const HOST = process.env.MYSQLHOST || 'localhost';
const USER = process.env.MYSQLUSER || 'root';
const PASSWORD = process.env.MYSQLPASSWORD || '';
const DATABASE = process.env.MYSQL_DATABASE || 'ejemplo';

const MySqlConnection = { host: HOST, user: USER, password: PASSWORD, database: DATABASE, port: PORTE };

const data = fs.readFileSync(path.join(__dirname, './swagger.json'), { encoding: 'utf8', flag: 'r' });
const obj = JSON.parse(data);

const swaggerOptions = {
    definition: obj,
    apis: [`${path.join(__dirname, "./index.js")}`],
};
/**
 * @swagger
 * tags:
 *   name: Empleados
 *   description: Operaciones relacionadas con empleados
 *
 * components:
 *   schemas:
 *     Empleado:
 *       type: object
 *       required:
 *         - Nombre
 *         - Apellido
 *         - Curp
 *       properties:
 *         idEmpleados:
 *           type: integer
 *           description: ID único generado automáticamente para el empleado
 *         Nombre:
 *           type: string
 *           description: Nombre del empleado
 *         Apellido:
 *           type: string
 *           description: Apellido del empleado
 *         Curp:
 *           type: string
 *           description: CURP del empleado
 */

/**
 * @swagger
 * /empleados:
 *   get:
 *     summary: Obtiene la lista de empleados.
 *     description: Retorna la lista completa de empleados almacenados en la base de datos.
 *     tags:
 *       - Empleados
 *     responses:
 *       200:
 *         description: Éxito. Retorna la lista de empleados.
 *         content:
 *           application/json:
 *             example:
 *               - idEmpleados: 1
 *                 Nombre: Juan
 *                 Apellido: Pérez
 *                 Curp: JUAP890123HDFLNM01
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Error en la base de datos.
 */
app.get("/empleados", async (req, res) => {
    try {
        const conn = await mysql.createConnection(MySqlConnection);
        const [rows, fields] = await conn.query('SELECT * from Empleados');
        res.json(rows);

    } catch (err) {
        res.status(500).json({ mensaje: err.sqlMessage });
    }
});

/**
 * @swagger
 * /empleados/{id}:
 *   get:
 *     summary: Obtiene un empleado por ID.
 *     description: Retorna los detalles de un empleado específico según el ID proporcionado.
 *     tags:
 *       - Empleados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del empleado a consultar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Éxito. Retorna los detalles del empleado.
 *         content:
 *           application/json:
 *             example:
 *               idEmpleados: 1
 *               Nombre: Juan
 *               Apellido: Pérez
 *               Curp: JUAP890123HDFLNM01
 *       404:
 *         description: No encontrado. El empleado con el ID proporcionado no existe.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Empleado no existe.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Error en la base de datos.
 */
app.get("/empleados/:id", async (req, res) => {
    console.log(req.params.id);
    try {
        const conn = await mysql.createConnection(MySqlConnection);
        const [rows, fields] = await conn.query('SELECT * FROM Empleados WHERE idEmpleados = ?', [req.params.id]);
        if (rows.length == 0) {
            res.status(404).json({ mensaje: "Empleado no existe" });
        } else {
            res.json(rows);
        }
    } catch (err) {
        res.status(500).json({ mensaje: err.sqlMessage });
    }
});
/**
 * @swagger
 * /insertar:
 *   post:
 *     summary: Inserta un nuevo empleado.
 *     description: Inserta un nuevo empleado en la base de datos con la información proporcionada.
 *     tags:
 *       - Empleados
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             Nombre: Juan
 *             Apellido: Pérez
 *             Curp: JUAP890123HDFLNM01
 *     responses:
 *       200:
 *         description: Éxito. Datos insertados correctamente.
 *         content:
 *           application/json:
 *             example:
 *               message: Datos insertados correctamente.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               message: Error al insertar datos.
 */
app.post('/insertar', async (req, res) => {
    try {
        const conn = await mysql.createConnection(MySqlConnection);

        const { Nombre, Apellido, Curp } = req.body;

        const [rows, fields] = await conn.execute(
            'INSERT INTO Empleados (Nombre, Apellido, Curp) VALUES (?, ?, ?)',
            [Nombre, Apellido, Curp]
        );

        res.json({ message: 'Datos insertados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al insertar datos' });
    }
});
/**
 * @swagger
 * /empleados/{id}:
 *   put:
 *     summary: Actualiza un empleado por ID.
 *     description: Actualiza la información de un empleado específico según el ID proporcionado.
 *     tags:
 *       - Empleados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del empleado a actualizar.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             Nombre: Juan
 *             Apellido: Pérez
 *             Curp: JUAP890123HDFLNM01
 *     responses:
 *       200:
 *         description: Éxito. Empleado actualizado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: ACTUALIZADO
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Error en la base de datos.
 */
app.put("/empleados/:id", async (req, res) => {
    try {
        const conn = await mysql.createConnection(MySqlConnection);
        const { Nombre, Apellido, Curp } = req.body;

        await conn.query(
            'UPDATE Empleados SET Nombre = ?, Apellido = ?, Curp = ? WHERE idEmpleados = ?',
            [Nombre, Apellido, Curp, req.params.id]
        );
        res.json({ mensaje: "ACTUALIZADO" });
    } catch (err) {
        res.status(500).json({ mensaje: err.sqlMessage });
    }
});
/**
 * @swagger
 * /empleados/{id}:
 *   delete:
 *     summary: Elimina un empleado por ID.
 *     description: Elimina un empleado específico de la base de datos según el ID proporcionado.
 *     tags:
 *       - Empleados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del empleado a eliminar.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Éxito. Empleado eliminado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Registro Eliminado
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               mensaje: Error en la base de datos.
 */
app.delete("/empleados/:id", async (req, res) => {
    try {
        const conn = await mysql.createConnection(MySqlConnection);
        const [rows, fields] = await conn.query('DELETE FROM Empleados WHERE idEmpleados = ?', [req.params.id]);

        if (rows.affectedRows == 0) {
            res.json({ mensaje: "Registro No Eliminado" });
        } else {
            res.json({ mensaje: "Registro Eliminado" });
        }

    } catch (err) {
        res.status(500).json({ mensaje: err.sqlMessage });
    }
});

const swaggerDocs = swaggerjsDoc(swaggerOptions);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.get("/options", (req, res) => {
    res.json(data);
});

app.use("/api-docs-json", (req, res) => {
    res.json(swaggerDocs);
});

app.listen(PORT, () => {
    console.log("Servidor express escuchando en el puerto " + PORT);
});
