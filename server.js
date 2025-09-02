/* The code snippet is setting up a Node.js server using Express framework along with some middleware
modules. Here's a breakdown of what each line is doing: */
const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { readdirSync } = require('fs');

// middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

readdirSync('./routers')
.map((r) => app.use('/api', require('./routers/' + r)));

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});