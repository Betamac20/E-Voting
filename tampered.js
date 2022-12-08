const nodemailer = require("nodemailer");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const dotenv = require("dotenv");
const { decode } = require("punycode");
const crypto  = require("crypto");
const fs = require("fs");
const Cryptr = require("cryptr");
const qr = require("qrcode");
const { timeEnd } = require("console");
const schedule = require('node-schedule');
dotenv.config({ path: './.env' });


const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});


const tampered = ["1", "41", "81", "121", "161", "201", "241", "281", "321", "361", "401", "441", "481", "521", "561", "601", "641", "681", "721", "761", "801", "841", "881", "921", "961", "1001", "1041", "1081", "1121", "1161", "1201", "1241", "1281", "1321", "1361", "1401", "1441", "1481", "1521", "1561", "1601", "1641", "1681", "1721", "1761", "1801", "1841", "1881", "1921", "1961", "2001", "2041", "2081", "2121", "2161", "2201", "2241", "2281", "2321", "2361", "2401", "2441", "2481", "2521", "2561", "2601", "2641", "2681", "2721", "2761", "2801", "2841", "2881", "2921", "2961"]
// const status = "Invalid";


for (i = 0; i < tampered.length; i++ ) {
    const id = tampered[i];
    const idSub = parseInt(id);
    const user_id = idSub + 2;
    db.query('UPDATE tbl_sample_voting_ecdsa SET user_id = ? WHERE id = ?',  [user_id, id], async (err, result) => {

        console.log("User ID No. "+user_id+" is back to normal...");

    });
    
}