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



// db.query('SELECT * FROM ecc_table', async (error, results) => {

  const sstartLooping = new Date();
  const sLoop = sstartLooping.getMilliseconds();

for (i=0; i < 3000; i++) {

//   const startLooping = new Date();
//   const sLoop = startLooping.getMilliseconds();
 const id = i+1;

// const id = results[i].id;
// const publicKey160 = results[i].Public_160;
// const privateKey160 = results[i].Private_160;
// const publicKey224 = results[i].Public_224;
// const privateKey224 = results[i].Private_224;
// const publicKey256 = results[i].Public_256;
// const privateKey256 = results[i].Private_256;
// const signature_256 = results[i].signature_256;
// var status;

// const payload = {
//   id: id
// }

// // generate pubkey and prikey
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 3072,
  // namedCurve: 'prime256v1',
publicKeyEncoding:  { type: 'spki', format: 'pem' },
privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// // const signature = jwt.sign(payload, privateKey256, {
// // algorithm: 'ES256',
// // });

// const endLooping = new Date();
// const eLoop = endLooping.getMilliseconds();
// const totaltime = (endLooping-startLooping);



// jwt.verify(signature_256, publicKey256, {algorithm: ['ES256']}, function(err, decoded) {
//       if(err) {
//         status = "Invalid";

//       }
//       else {
        
//         if (decoded !== undefined) {
//           status = "Valid";
//         }
//         else
//         {
//           status = "Invalid";
//         }
//       }

//       // db.query('UPDATE ecc_table SET signature_256 = ? WHERE id = ?',  [signature, id], async (err, result) => {
//       //   if(err) {
//       //       console.log(err);
//       //     }
//       //   });


//       // console.log(signature);
//       console.log("No. "+id+" Done... Status: "+ status);
//     });



//       // console.log(signature);
//       // console.log();
      console.log("No. "+id+" Done...");
}


  const eendLooping = new Date();
  const eeLoop = eendLooping.getMilliseconds();
  const ttotaltime = (eendLooping-sstartLooping);

  // var ttotaltime = 451;

  // db.query('SELECT SUM(validation_time) as sumtime FROM rsa_sample', async (error, sum) => {
  //   db.query('SELECT AVG(validation_time) as avgtime FROM rsa_sample', async (error, avg) => {
  //   const totaltime = sum[0].sumtime;
  //   const avgtime = avg[0].avgtime;
    // console.log();
    // console.log();
    // console.log("RSA Key Generation - Key Length of 3072 Bits");
    // console.log();
    // console.log("Total time: "+ttotaltime+" ms");
    // console.log("Average time: "+((ttotaltime/3000).toFixed(4))+" ms");
    // console.log();
  //   });
  // });
// });

