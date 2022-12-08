
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const dotenv = require("dotenv");
const { decode } = require("punycode");
const crypto  = require("crypto");
const fs = require("fs");
const Cryptr = require("cryptr");
const { param } = require("./routes/pages");
dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});


// const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
//     // modulusLength: 3072,
//     namedCurve: 'E-222',
//   publicKeyEncoding:  { type: 'spki', format: 'pem' },
//   privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
//   });

//   console.log(privateKey)
//   console.log(publicKey)

  console.log(crypto.getCurves())