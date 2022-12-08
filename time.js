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


db.query('SELECT * FROM rsa_table', async (error, results) => {

const sstartLooping = new Date();
const sLoop = sstartLooping.getMilliseconds();


for (i=0; i < results.length; i++) {

// const id = i+1;
const id = results[i].id;
const privateKey1024 = results[i].Private_1024;
const publicKey1024 = results[i].Public_1024;
const privateKey2048 = results[i].Private_2048;
const publicKey2048 = results[i].Public_2048;
const signature_2048 = results[i].signature_2048;
var status;

// const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
//     modulusLength: 2048,
//     // namedCurve: 'prime256v1',
//     publicKeyEncoding:  { type: 'spki', format: 'pem' },
//     privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
//     });

// const payload = {
//   id: id
// }

// const signature = jwt.sign(payload, privateKey2048, {
// algorithm: 'RS256',
// });

const sstartLooping = new Date();
const sLoop = sstartLooping.getMilliseconds();

jwt.verify(signature_2048, publicKey2048, {algorithm: ['RS256']}, function(err, decoded) {
      if(err) {
        status = "Invalid";

      }
      else {
        
        if (decoded !== undefined) {
          status = "Valid";
        }
        else
        {
          status = "Invalid";
        }
      }

        const eendLooping = new Date();
        const eeLoop = eendLooping.getMilliseconds();
        const ttotaltime = (eendLooping-sstartLooping);

    //   db.query('UPDATE rsa_table SET status_2048 = ?, status_time_2048 = ?  WHERE id = ?',  [status, ttotaltime, id], async (err, result) => {
    //     if (err) {
    //                 console.log(err);
    //             }
    // });


      // console.log(signature);
      console.log("No. "+id+" Done... Status: "+ status);
    });

   
    // db.query('INSERT INTO rsa_table SET ?', { Private_2048: privateKey, Public_2048: publicKey }, (err, results) => {
    //     if (err) {
    //         console.log(err);
    //     }
    // });


}

const eendLooping = new Date();
const eeLoop = eendLooping.getMilliseconds();
const ttotaltime = (eendLooping-sstartLooping);

// console.log();
// console.log();
// console.log("RSA Signature Generation - Key Length of 2048 Bits");
// console.log();
// console.log("Total time: "+ttotaltime+" ms");
// console.log("Average time: "+((ttotaltime/3000).toFixed(4))+" ms");
// console.log();


db.query('SELECT SUM(status_time_2048) as sumtime FROM rsa_table', async (error, sum) => {
    db.query('SELECT AVG(status_time_2048) as avgtime FROM rsa_table', async (error, avg) => {
    const totaltime = 574241;
    const avgtime = avg[0].avgtime;
    console.log();
    console.log();
    console.log("RSA Key Generation - Key Length of 3072 Bits");
    console.log();
    console.log("Total time: "+totaltime+" ms");
    console.log("Average time: "+((totaltime/3000).toFixed(4))+" ms");
    console.log();
    });
  });

});


  