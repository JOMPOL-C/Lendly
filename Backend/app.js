const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const dbConfig = require('../config/dbConfig');

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:8888',
    credentials: true,
}));
app.use(cookieParser());

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}))

const port = 8000
const secret = 'mysecret';

let conn = null;

const initMysql = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'Lendly_db'
    });
}

app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Lendly API' });
});

app.listen(port, async () => {
    await initMysql();
    console.log(`Server is running on http://localhost:${port}`);
});