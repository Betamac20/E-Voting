const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const crypto  = require("crypto");
const Cryptr = require("cryptr");

dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
        
//         db.query('SELECT * FROM tbl_users WHERE email = ?', [email], async (err, results) => {
//             console.log(results);
//             if (!results || !await bcrypt.compare(password, results[0].password)) {
//                 res.render("login",{
//                     message: 'The credentials are not matched'
//                 })
//             } else {

//             }
//         })
//     } catch (err) {
//         console.log(err);
//     }
// }

exports.login = (req, res) => {
    // console.log(req.body);

    const { email, password  } = req.body;

    try {
        db.query('SELECT email FROM tbl_users WHERE email = ?',  [email], async (error, results) => {

            if(error) {
                console.log(error);
            } 
    
            // console.log(results);
    
            if (results.length > 0) {
    
               db.query('SELECT password FROM tbl_users WHERE email = ?',  [email], async (error, results) => {
                
                    if(error) {
                        console.log(error);
                    } 
                    // console.log(results);
    
                    bcrypt.compare(password, results[0].password, function(error, result) {
                        if(error) {
                            console.log(error);
                        } 
                        if(result) {   
                            ////////
                            db.query('SELECT * FROM tbl_users WHERE email = ?',  [email], async (error, results) => {

                                if(error) {
                                    console.log(error);
                                } 
                                if(results[0].is_verified === "Yes") {
                                    // console.log("Verified");
                                    db.query('SELECT * FROM tbl_users WHERE email = ?',  [email], async (error, results) => {
                                        if(error) {
                                            console.log(error);
                                        } 
                                                
                                        const id = results[0].id;
                                        
                                        const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                                            expiresIn: process.env.JWT_EXPIRES
                                        });
                        
                                        // console.log("the token is " + token);
                        
                                        const cookieOptions = {
                                            expires: new Date(
                                                Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                                            ),
                                            httpOnly: true
                                        }
                                        res.cookie('userSave', token, cookieOptions);
                                        res.status(200).redirect("/home");
                                                    
                                                });
                                } else {
                                    res.redirect("/verify");
                                }
                            
                            
                            });                            
                          }
                          else {
                            return res.render('login', {
                                message: 'The credentials are not matched.'
                            });
                          }
    
                    });
                });
            }
            else {
                console.log(results);
                return res.render('login', {
                    notReg: 'The credentials are not registered.'
                });
            }
    
            // const match = await bcrypt.compare(password, results);
    
        }); // end of email
    } 
    catch (err) {
        console.log(err);
    }

        
}


exports.register = (req, res) => {
    // console.log(req.body);
    const { student_id, department, yr_level, gender, email, password, confirm_password } = req.body;
    const name = req.body.first_name + " " + req.body.last_name;
    var avatar;
    const role = "1";

    if (gender == "Male")
    {
        avatar = "avatar.png";
    }
    else if (gender == "Female")
    {
        avatar = "avatar_female.png";
    }

    db.query('SELECT student_id FROM tbl_users WHERE student_id = ?', [student_id], (err, results) => {
        // ----
        if (err) {
            console.log(err);
        } else {
            if (results.length > 0) {
                res.render("register",{
                    message: 'The Student ID is already registered'
                })
            }

            db.query('SELECT email from tbl_users WHERE email = ?', [email], async (err, results) => {
                if (err) {
                    console.log(err);
                } else {
                    if (results.length > 0) {
                        res.render("register",{
                            message: 'The email is already registered'
                        })
                    } else if (password !== confirm_password) {
                        res.render("register",{
                            message: 'Password does not matched'
                        });
                    }
                }
        
                let hashedPassword = await bcrypt.hash(password, 10);
                // console.log(hashedPassword);
                
                db.query('INSERT INTO tbl_users SET ?', { student_id: student_id, name: name, department: department, yr_level: yr_level, gender: gender, email: email, password: hashedPassword, user_avatar: avatar, role: role }, (err, results) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("register",{
                            success: 'You are successfully registered'
                        });
                    }
                });
            });

        } // student id

    });
    // res.send("Form submitted");
}


exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.userSave) {
        try {
            // 1. Verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.userSave,
                process.env.JWT_SECRET
            );
            // console.log(decoded);

            // 2. Check if the user still exist
            db.query('SELECT * FROM tbl_users WHERE id = ?', [decoded.id], (err, results) => {
                // console.log(results);
                if (!results) {
                    return next();
                }
                req.user = results[0];
                return next();
            });
        } catch (err) {
            console.log(err)
            return next();
        }
    } else {
        next();
    }
}


exports.logout = (req, res) => {
    res.cookie('userSave', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect("/");
}



exports.emailverification = async (req, res) => {
    const email = req.body.email;

    let code_a = Math.floor(Math.random() * 10);
    let code_b = Math.floor(Math.random() * 10);
    let code_c = Math.floor(Math.random() * 10);
    
    // let code_d = Math.floor(Math.random() * 10);
    // let code_e = Math.floor(Math.random() * 10);
    // let code_f = Math.floor(Math.random() * 10);
    
    let code_x = Math.floor(Math.random() * 10);
    let code_y = Math.floor(Math.random() * 10);
    let code_z = Math.floor(Math.random() * 10);
    
    const code = code_x+""+code_y+""+code_z+""+code_a+""+code_b+""+code_c;

    var param = [
        code,
        email
    ]

    db.query('SELECT * FROM tbl_users WHERE email = ?',  [email], async (error, results) => {
        if(error) {
            console.log(error);
        } 
        if (results.length > 0) {

            /////////
            db.query('UPDATE tbl_users SET verification_code = ?  WHERE email = ?',  param, async (error, results) => {
                if(error) {
                    console.log(error);
                } else {
                    let mailTransporter = nodemailer.createTransport ({
                        service: 'gmail',
                        port:465,
                        secure: true,
                        secureConnection: false,
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.EMAIL_PASSWORD, 
                        },
                        tls:{
                            rejectUnAuthorized:true
                        }
                    });
                    
                    let details = {
                        from: process.env.EMAIL,
                        to: email,
                        subject: "Verification Code",
                        text: "Your verification code: " + code
                    }
                    
                    mailTransporter.sendMail(details, (err) => {
                        if (err) {
                            console.log("Error occured", err);
                        } else {
                            console.log(code);
                            console.log("email sent!");
                            res.render('email/verification-code', {
                                email: email
                            });
                        }
                    });
                }
            });

        }
        else {
            console.log(results);
            return res.render('email/verify-email', {
                notReg: 'The credentials are not registered.'
            });
        }


    });
    
    

}

exports.verifycode = async (req, res) => {
    const email = req.body.email;
    const verication_code = req.body.verification_code;
    const dateObject = new Date();
    const is_verified = "Yes";
    
    console.log(email);
    // year
    var year = dateObject.getFullYear();
    // month
    var month = (dateObject.getMonth()+ 1);
    
    if (month < 10) 
        {month = "0"+month;}
    else
        {month = month;}
    
    // day
    var day = dateObject.getDate();
    
    if (day < 10) 
        { day = "0"+day;}
    else
        { day = day;}
    
    // hours
    var hour = dateObject.getHours();
    if (hour < 10) 
        { hour = "0"+hour;}
    else
        { hour = hour;}
    
    //minutes
    var minute = dateObject.getMinutes();    
    
    if (minute < 10)
        {minute = "0"+minute;}
    else
        {minute = minute;}
    
    
    // seconds
    var second = dateObject.getSeconds();
    if (second < 10)
        {second = "0"+second;}
    else
        {second = second;}
    
    // date
    const date = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;    

    const param = [
        is_verified,
        date,
        email
    ]

    db.query('SELECT * FROM tbl_users WHERE email = ?',  [email], async (error, results) => {
        if(error) {
            console.log(error);
        } 

        if (results.length > 0) {

            if (results[0].verification_code === verication_code) {

                console.log();
                console.log("Generating of Public and Private Key...");
                var startObject = new Date();
                console.log();
                console.log("Start: "+startObject.getMilliseconds()+" ms");
                
                db.query('UPDATE tbl_users SET is_verified = ?, verified_at = ?  WHERE email = ?',  param, async (error, results) => {
                    if(error) {
                        console.log(error);
                    } else {

                        // generate pubkey and prikey
                        const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
                            namedCurve: 'prime256v1',
                            publicKeyEncoding:  { type: 'spki', format: 'pem' },
                            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
                          });

                          const enc_sec = process.env.ENC_SECRET;
                          const pbkdf2Iterations = parseInt(process.env.pbkdf2Iterations);
                          const cryptr = new Cryptr(enc_sec, pbkdf2Iterations);

                          const pubkey = cryptr.encrypt(publicKey);
                          const prikey = cryptr.encrypt(privateKey);

                          const param = [
                            pubkey,
                            prikey,
                            email
                        ];

                          db.query('UPDATE tbl_users SET public_key = ?, private_key = ?  WHERE email = ?',  param, async (error, results) => {

                            if(error) {
                                console.log(error);
                            } else {

                                db.query('SELECT * FROM tbl_users WHERE email = ?',  [email], async (error, results) => {
                                    if(error) {
                                        console.log(error);
                                    } else {
                                        const id = results[0].id;
                                                
                                        const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                                            expiresIn: process.env.JWT_EXPIRES
                                        });
                        
                                        const cookieOptions = {
                                            expires: new Date(
                                                Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                                            ),
                                            httpOnly: true
                                        }

                                        var endObject = new Date();
                                        
                                        console.log("End: "+endObject.getMilliseconds()+" ms");
                                        console.log("Diffirence: "+(endObject - startObject)+" ms");
                                        console.log();
                                        console.log("Public and Private Key are successfully generated...");
                                        res.cookie('userSave', token, cookieOptions);
                                        res.status(200).redirect("/home");                                
                                    }
                                });

                            }

                          });
                        
                    }
                });
            } else {
                console.log(results);
                return res.render('email/verify-email', {
                    message: 'Invalid verification code.'
                });
            }

        } else {
            console.log(results);
            return res.render('email/verify-email', {
                notReg: 'The credentials are not registered.'
            });
        }


    });


}

// viewing of candidate's profiles
exports.viewcandidate = async (req, res) => {

    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        const candidate_id = req.body.candidate_id;
        // res.render("student/vote")
        db.query('SELECT * FROM tbl_sample_candidate', async (error, allCandidate) => {

            if(error) {
                throw error
            } 
            else
            {

                db.query('SELECT * FROM tbl_sample_candidate WHERE id = ?', [candidate_id], async (error, oneCandidate) => {

                if(error) {
                    throw error
                } 
                else
                {
                    db.query('SELECT * FROM tbl_users WHERE id = ?', [id], async (error, data) => {

                        res.render("student/view-candidate", {action: 'list', allData: allCandidate, userData: data, oneData: oneCandidate});

                    });
                    
                }

                });

            }

        });
        
        } else {
            res.redirect("login")
        }

}


exports.verifysignature = async (req, res) => {

    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        const candidate_id = req.body.candidate_id;
        // res.render("student/vote")

        db.query('SELECT user_id from tbl_voting_transaction WHERE user_id = ?', [id], async (err, resultID) => {
            if (err) {
                console.log(err);
            } else {
                if (resultID.length > 0) {
                    res.render("student/verify-status", {invalid: 'You already voted. You do not have vote balance left.'});
                } else { 

                    db.query('SELECT * FROM tbl_sample_candidate', async (error, allCandidate) => {

                        if(error) {
                            throw error
                        } 
                        else
                        {
            
                            db.query('SELECT * FROM tbl_sample_candidate WHERE id = ?', [candidate_id], async (error, oneCandidate) => {
            
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                db.query('SELECT * FROM tbl_users WHERE id = ?', [id], async (error, data) => {
            
                                    res.render("student/verify-signature", {action: 'list', allData: allCandidate, userData: data, oneData: oneCandidate});
            
                                });
                                
                            }
            
                            });
            
                        }
            
                    });
                    
                }
            }
        });
        
        } else {
            res.redirect("login")
        }
}

exports.castvote = async (req, res) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const user_id = decoded.id;
        const privateKey = req.body.private_key
        const position_id = req.body.position_id;
        const candidate_id = req.body.candidate_id;
        const candidate_name = req.body.candidate_name;
        var vote;
        // var candidate = [];
        var position;
        var enc_id;
        var enc_candidate_name;
        var enc_position;
        var enc_vote;
        var enc_user_id;

        db.query('SELECT user_id from tbl_voting_transaction WHERE user_id = ?', [user_id], async (err, resultID) => {
            if (err) {
                console.log(err);
            } else {
                if (resultID.length > 0) {
                    res.render("student/verify-status", {invalid: 'You already submitted your vote credentials.'});
                } else {

                    db.query('SELECT * FROM tbl_sample_candidate WHERE id = ?',  [candidate_id], async (error, results) => {
    
                        if(error) {
                            console.log(error);
                        } else {
                            db.query('SELECT position, vote_per_user FROM tbl_sample_position WHERE id = ?;',  [position_id], async (error, resPosition) => {
                
                                if(error) {
                                    console.log(error);
                                } else {
                
                                    
                                    // Start of encryption of data
                                    var startObject = new Date();
                                    console.log();
                                    console.log("Start of Verification of Private Key: "+ startObject.getMilliseconds()+ " ms");

                                    position = resPosition[0].position; // position
                                    // candidate_name = results[0].candidate_name; // candidate name
                                    vote = resPosition[0].vote_per_user; // num of vote per user
                
                                    const enc_sec = process.env.ENC_SECRET;
                                    const pbkdf2Iterations = parseInt(process.env.pbkdf2Iterations);
                                    const cryptr = new Cryptr(enc_sec, pbkdf2Iterations);

                                    enc_user_id = cryptr.encrypt(user_id);
                                    enc_id = cryptr.encrypt(candidate_id);
                                    enc_position = cryptr.encrypt(position);
                                    enc_candidate_name = cryptr.encrypt(candidate_name);
                                    enc_vote = cryptr.encrypt(vote);
                                    
                                    

                                    // header
                                    const header = {
                                        "algorithm": "ES256"
                                    };
                
                                    // payload
                                    const payload =  {
                                        user_id: enc_user_id,
                                        candidate_id: enc_id,
                                        position: enc_position,
                                        candidate_name: enc_candidate_name,
                                        vote: enc_vote
                                    };
                                    
                                    
                                    db.query('SELECT id, private_key, public_key, email FROM tbl_users WHERE id = ?',  [user_id], async (error, userResult) => {
                
                                        if(error) {
                                            console.log(error);
                                        } else {
                                    
                                    //private key
                                    var status;
            
                                    if (userResult[0].private_key == privateKey)
                                    {
                                        
                                    // Private Key 
                                    const email = userResult[0].email;
                                    const privateEcdsaKey = cryptr.decrypt(privateKey);
                                    const publicKey = userResult[0].public_key;
                                    const publicEcdsaKey = cryptr.decrypt(publicKey);
                                    
                                    // verifying signature
                                     jwt.sign(payload, privateEcdsaKey, {algorithm: 'ES256'} , function (err, signed) {
                                        if(err) {
                                            status = "Tampered or Invalid";
                                            // console.log(err);
                                            var endObject = new Date();
                                            console.log("End: "+endObject.getMilliseconds()+" ms");                                                
                                            console.log("Difference: "+(endObject-startObject)+" ms");
                                            console.log();
                                            console.log("The signature transaction is "+status);
                                            res.render("student/verify-status", {invalid: 'The credential is invalid.'});
                                        } else {

                                                // signature
                                                    const signature = jwt.sign(payload, privateEcdsaKey, {
                                                        algorithm: 'ES256',
                                                        });
                                                // True 
                                                
                                                    // verification of signature
                                                    jwt.verify(signature, publicEcdsaKey, {algorithm: 'ES256'}, function(err, decoded) {
                                                        if(err) {
                                                            // console.log(err);
                                                            // console.log(signature);
                                                            status = "Tampered or Invalid";
                                                            var endObject = new Date();
                                                            console.log("End: "+endObject.getMilliseconds()+" ms");                                                
                                                            console.log("Difference: "+(endObject-startObject)+" ms");
                                                            console.log();
                                                            console.log("The verification transaction is "+status);
                                                            res.render("student/verify-status", {invalid: 'The credential is invalid.'});
                                                        }
                                                        else                                    
                                                        {

                                                        if (decoded !== undefined) {
                                                            // True
                                                            status = "Valid";
                                                        }
                                                        else
                                                        {
                                                            //False
                                                            status = "Invalid";
                                                        }
                            
                                                        // insert data to voting transaction
                                                        db.query('INSERT INTO tbl_voting_transaction SET ?', { hash:signature, user_id:user_id, candidate_id: candidate_id, position:position, candidate_name: enc_candidate_name, vote:vote, status:status  }, (err, results) => {
                                                            if (err) {
                                                                console.log(err);
                                                            } else {
                                                                var endObject = new Date();                                             
                                                                console.log("End: "+endObject.getMilliseconds()+" ms");                                                
                                                                console.log("Difference: "+(endObject-startObject)+" ms");
                                                                console.log();
                                                                console.log("Result: Private Key is - "+status);
                                                                console.log("The student is successfully voted");

                                                                res.render("student/verify-status",{
                                                                    validSignature: 'Your vote credential is successfully submitted. Thank you for voting.'
                                                                });
                                                            }
                                                        });
                            
                                                        }//
                            
                                                    });


                                        }
                                        });
                                           
                                    }
                                    else
                                    {
                                        // Private Key Invalid
                                        status = "Tampered or Invalid";
                                        var endObject = new Date();
                                        console.log("End: "+endObject.getMilliseconds()+" ms");                                                
                                        console.log("Difference: "+(endObject-startObject)+" ms");
                                        console.log();
                                        console.log("The verification transaction is "+status);
                                        res.render("student/verify-status", {invalid: 'The credential is invalid.'});
                                    }
                                        }
                                    });
            
                                }
                
                            });
                
                        }
                
                    });
                     
                }
            }
        });
        
        } else {
            res.redirect("login")
        }

}