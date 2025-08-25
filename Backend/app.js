
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ['http://localhost:8888',]
}))
app.use(cookieParser());

app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
}));

const port = 8000;
const secret = 'mysecret';

app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Lendly API!' });
});

app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
});

//API Routes
const registerRouter = require('./router/api/register');
app.use('/api/register', registerRouter);