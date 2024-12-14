const express = require('express');
const morgan = require('morgan'); // Importa Morgan
const { Pool } = require('pg');
const request = require('supertest');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const dotenv = require('dotenv');
const cors = require('cors');
// Middleware para logs HTTP
app.use(morgan('combined')); // Usar formato 'combined' para obtener detalles de las solicitudes

const app = express();
const port = process.env.PORT || 3000;

dotenv.config(); // Load environment variables from .env file

// Configuración del pool de conexiones
const pool = new Pool({
  user: process.env.POSTGRES_USER,       // Usuario, debe coincidir con el deployment
  host: process.env.POSTGRES_HOST,       // Host del servicio de la base de datos
  database: process.env.POSTGRES_DB,     // Nombre de la base de datos
  password: process.env.POSTGRES_PASSWORD, // Contraseña, debe coincidir con el deployment
  port: process.env.POSTGRES_PORT || 5432 // Puerto (generalmente 5432)
});

// Función para realizar consultas a la base de datos
async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res.rows;
  } catch (err) {
    console.error('Error al ejecutar la consulta:', err);
    throw err; // Propagar el error para que pueda ser manejado en un nivel superior
  }
}

// Middleware
app.use(express.json());
const corsOptions = {
  origin: '*',  // Permite todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  // Si usas cookies o autenticación basada en sesiones
};

app.use(cors(corsOptions));

// Configurar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Crear una compra
app.post('/compras', async (req, res) => {
  const { producto, cantidad, precio } = req.body;
  const query = 'INSERT INTO compras(producto, cantidad, precio) VALUES($1, $2, $3) RETURNING *';
  try {
    const result = await pool.query(query, [producto, cantidad, precio]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la compra' });
  }
});

// Obtener compras
app.get('/compras', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM compras');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las compras' });
  }
});

// Actualizar una compra
app.put('/compras/:id', async (req, res) => {
  const { id } = req.params;
  const { producto, cantidad, precio } = req.body;
  const query = 'UPDATE compras SET producto = $1, cantidad = $2, precio = $3 WHERE id = $4 RETURNING *';
  try {
    const result = await pool.query(query, [producto, cantidad, precio, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la compra' });
  }
});

// Eliminar una compra
app.delete('/compras/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM compras WHERE id = $1';
  try {
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la compra' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log('Microservicio de compras escuchando en puerto ${port}');
});