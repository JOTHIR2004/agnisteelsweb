const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');

dotenv.config({
  path: './.env',
});

const app = express();

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('MySQL connection success');
  }
});

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const location = path.join(__dirname, './public');
app.use(express.static(location));
app.set('view engine', 'hbs');

const partialsPath = path.join(__dirname, './views/partials');
hbs.registerPartials(partialsPath);

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
