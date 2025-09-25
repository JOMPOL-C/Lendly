const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { readdirSync } = require('fs');


require('dotenv').config();



// middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


// route
readdirSync('./src/routers')
.forEach((file) => {
    const route = require('./src/routers/' + file);
    console.log('👉 Loaded file:', file,);
    app.use('/api', route);
  });


app.listen(8000, () => {
    console.log('Server is running on port 8000');
});