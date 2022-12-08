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

// ============================================VALIDATION====================================================// 

    // db.query('SELECT id, status, validation_time FROM ecdsa_sample', async (error, results) => {

    // for (i=0; i < results.length; i++) {

    // const id = results[i].id;
    // const status = results[i].status;
    // const validation_time = results[i].validation_time;

    // console.log("No. "+id+" ECDSA validation status: "+status+" | Time: "+validation_time+" ms...");
    // }

    // });
// ========================================================================================================= //
db.query('SELECT tbl_users.private_key, tbl_users.public_key, tbl_voting_transaction.user_id, tbl_voting_transaction.hash, tbl_voting_transaction.candidate_id, tbl_voting_transaction.position, tbl_voting_transaction.candidate_name, tbl_voting_transaction.vote, tbl_voting_transaction.status FROM tbl_voting_transaction INNER JOIN tbl_users ON tbl_users.id = tbl_voting_transaction.user_id', async (error, results) => {

    const enc_sec = process.env.ENC_SECRET;
    const pbkdf2Iterations = parseInt(process.env.pbkdf2Iterations);
    const cryptr = new Cryptr(enc_sec, pbkdf2Iterations);
    
      var startLooping = new Date();
      var sLoop = startLooping.getMilliseconds();

      for (i=0; i<results.length; i++) {

      const startLooping = new Date();
      const sLoop = startLooping.getMilliseconds();
            // === start time ===

    
        var id = results[i].user_id;
        const pubkey = results[i].public_key;
        var candidate_id = results[i].candidate_id;
        var position = results[i].position;
        var candidate_name = cryptr.decrypt(results[i].candidate_name);
        var vote = results[i].vote;
        const public_key = cryptr.decrypt(pubkey);
        var status;
  


                const signature = results[i].hash;
                jwt.verify(signature, public_key, {algorithm: 'ES256'}, function(err, decoded) {
                  if(err) {
                    status = process.env.STATUS2;
                  }
                  else                                    
                  {
                  if (decoded !== undefined) {
                        // True
                        const verified_user_id = cryptr.decrypt(decoded.user_id);
                        const verified_candidate_id = cryptr.decrypt(decoded.candidate_id);
                        const verified_position = cryptr.decrypt(decoded.position);
                        const verified_vote = cryptr.decrypt(decoded.vote);
                        const verified_candidate_name = cryptr.decrypt(decoded.candidate_name);

                        if ( verified_user_id == id && verified_candidate_id == candidate_id && verified_position == position && verified_candidate_name == candidate_name && verified_vote == vote )
                        {
                          status = process.env.STATUS1;
                        }
                        else
                        {
                          status = process.env.STATUS2;
                        }                        
                    }
                    else
                    {
                        //False
                        status = process.env.STATUS2;
                    }

                  }
                  const endLooping = new Date();
                  const eLoop = endLooping.getMilliseconds();
                  const totaltime = (endLooping-startLooping);
                    console.log();
                    console.log("Validating voting transaction no. "+(id)+"...... | Result: "+status+" | Time: "+(totaltime)+" ms"); 
                db.query('UPDATE tbl_voting_transaction SET status = ? WHERE user_id = ?',  [status, id], async (err, result) => {
                    if(err) {
                        console.log(err);
                      }
                });
                });
  
                 
                }

                var endLooping = new Date();
                var eLoop = endLooping.getMilliseconds();
                var totaltime = (endLooping-startLooping);

                console.log();        
                console.log("Done Validation...| Total time: "+totaltime+" ms | Average Time: " +(totaltime/results.length)+" ms");
});


  // ============================================VALIDATION====================================================// 

  // ============================================GENERATION====================================================// 

    // for (i=0; i<3000; i++) {
    // const keystart = new Date(); 
    // const start = keystart.getMilliseconds();

    // const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    // namedCurve: 'prime256v1',
    // // namedCurve: 'secp256k1',
    // // modulusLength: 1024,
    // publicKeyEncoding:  { type: 'spki', format: 'pem' },
    // privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    // });
    
    // const keyend = new Date();
    // const end = keyend.getMilliseconds()
    // // console.log();
    // // console.log();
    // console.log("No. "+(i+1)+" ECDSA private and public key is successfully generated | Time: "+(keyend - keystart) +" ms ");
    // // console.log("Public key: ");
    // // console.log(publicKey);
    // // console.log();
    // // console.log("Private key: ");
    // // console.log(privateKey);    
    // }

    // for (i=0; i<3000; i++) {
        // const keystart = new Date(); 
        // const start = keystart.getMilliseconds();
    
        // const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        // // namedCurve: 'prime256v1',
        // namedCurve: 'secp224k1',
        // // modulusLength: 512,
        // publicKeyEncoding:  { type: 'spki', format: 'pem' },
        // privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        
        // });

        // console.log(publicKey);
        // console.log();
        // console.log(privateKey)

        // crypto.generateKey('aes', { length: 256}, (err, key) => {
        //     if (err) throw err;
        //     console.log(key.export().toString('base64'));  // 46e..........620
        //   });

        
        // const keyend = new Date();
        // const end = keyend.getMilliseconds()
        // console.log();
        // console.log();
        // console.log("No. "+(1)+" RSA private and public key is successfully generated | Time: "+(keyend - keystart) +" ms | Pubkey Length: "+(publicKey.length)+" Prikey Length: "+(privateKey.length));
        // console.log("Public key: ");
        // console.log(publicKey);
        // console.log();
        // console.log("Private key: ");
        // console.log(privateKey);    
        // }
  // ============================================GENERATION====================================================// 