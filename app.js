const express = require("express");
const path = require("path")
const mysql = require("mysql");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const hbs = require('hbs');
const schedule = require('node-schedule');

const app = express();
dotenv.config({ path: './.env' });

const publicDirectory = path.join(__dirname, './public');
const partialpath = path.join(__dirname, './public/partials');
hbs.registerPartials(partialpath);

app.use(express.static(publicDirectory));

hbs.registerHelper('dateFormat', require('handlebars-dateformat'));

app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'hbs');
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Database Connected")
    }
})
// Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5000, () => {
    console.log("Server started on Port 5000");
});
