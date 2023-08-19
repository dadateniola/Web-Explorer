const express = require('express');
const path = require('path');
const controller = require('./zzz/methods/controller');

const app = express();
const port = 5000;

// app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static(path.join(__dirname, 'zzz', 'assets')));
app.use(express.static(path.join(__dirname, 'Websites')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'zzz', 'pages'));

app.use(controller)

app.listen(port, err => console.log(err || `Visit http://localhost:${port}/`));