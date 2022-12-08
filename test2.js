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

db.query('SELECT ecdsa_sample.private_key, ecdsa_sample.public_key, tbl_sample_voting_ecdsa.user_id, tbl_sample_voting_ecdsa.hash, tbl_sample_voting_ecdsa.candidate_id, tbl_sample_voting_ecdsa.position, tbl_sample_voting_ecdsa.candidate_name, tbl_sample_voting_ecdsa.vote, tbl_sample_voting_ecdsa.status FROM tbl_sample_voting_ecdsa INNER JOIN ecdsa_sample ON ecdsa_sample.id = tbl_sample_voting_ecdsa.user_id', async (error, results) => {

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
        const public_key = results[i].public_key;
        var candidate_id = results[i].candidate_id;
        var position = results[i].position;
        var candidate_name = cryptr.decrypt(results[i].candidate_name);
        var vote = results[i].vote;
        // const public_key = cryptr.decrypt(pubkey);
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
                db.query('UPDATE tbl_sample_voting_ecdsa SET status = ? WHERE user_id = ?',  [status, id], async (err, result) => {
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
