const express = require('express');
const cors = require('cors');
const { createTables, pool } = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());


app.use(express.json());

// Create tables on startup
createTables();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/buildings', require('./routes/building'));
app.use('/api', require('./routes/getBuildings'))

app.get('/', (req, res) => {
    res.send('ARNavic Node Backend is running');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
