const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const crypto  = require("crypto");
const Cryptr = require("cryptr");
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-creator-node");
const options = require("../helpers/options");

dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

exports.adminLogin = (req, res) => {
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

                                        db.query('SELECT role FROM tbl_users WHERE email = ?',  [email], async (error, role) => {
                                            if(error) {
                                                console.log(error);
                                            } 

                                            if (role[0].role == "0")  {
                                                const id = results[0].id;
                                                const newrole = role[0].role;
                                                const token = jwt.sign({ id:id, role:newrole }, process.env.JWT_SECRET, {
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
                                                res.status(200).redirect("/admin-home");
                                            }
                                            else
                                            { 
                                                return res.render('admin/login', {
                                                    message: 'Restricted for administrator only.'
                                                });
                                            }

                                        });
                                                    
                                    });
                                } else {
                                    return res.render('admin/login', {
                                        message: 'You cannot login you are not verified.'
                                    });
                                }
                            
                            
                            });                            
                          }
                          else {
                            return res.render('admin/login', {
                                message: 'The credentials are not matched.'
                            });
                          }
    
                    });
                });
            }
            else {
                console.log(results);
                return res.render('admin/login', {
                    message: 'The credentials are not registered.'
                });
            }
    
            // const match = await bcrypt.compare(password, results);
    
        }); // end of email
    } 
    catch (err) {
        console.log(err);
    }

        
}


exports.adminLogout = (req, res) => {
    res.cookie('userSave', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect("/admin-home");
}

exports.viewvote = async (req, res) =>  {
    
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        const candidate_id = req.body.candidate_id;
        const position = "President";
        const status = "Valid";
        // res.render("student/vote")
        
        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, userData) => { 

            if(error) {
                throw error
            } 
            else
            {

                db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_sample_voting_ecdsa  WHERE position = ?  GROUP BY candidate_id  ', [position], async (error, votingData) => { 

                    if(error) {
                        throw error
                    } 
                    else
                    {

                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_sample_voting_ecdsa  WHERE candidate_id = ? AND position = ? AND status = ?  GROUP BY candidate_id  ', [candidate_id, position, status], async (error, candidateData) => { 

                            if(error) {
                                throw error
                            } 
                            else
                            {
                                const role = "1";
                                const totalvote = candidateData[0].sum_vote;
                                db.query('SELECT *, COUNT(id) AS total_user FROM tbl_users WHERE role = ? ', [role], async (error, percentage) => { 
                                
                                const totaluser = percentage[0].total_user;
                                var totalpercentage = (totalvote / totaluser) * 100;
                                totalpercentage = +totalpercentage.toFixed(2);
                                
                                db.query('SELECT * FROM tbl_election ORDER BY id DESC LIMIT 3', async (error, electionData) => { 

                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                    
                                   
                                        
                                        res.render("admin/view-vote", {action: 'list', userData: userData, votingData: votingData, candidateData: candidateData, percentageData: totalpercentage, totalUser: totaluser, electionData: electionData});
                                    
                                    
                                            
                                    }
                                });

                               
                                
                                });
        
                                
                            }
                        });

                    }

                });

            }

        });
        
        } else {
            res.redirect("/admin")
        }
}

exports.createelection = async (req, res) =>  {
    
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        const election_title = req.body.election_title;
        const election_department = req.body.election_department;
        const election_start_date = req.body.election_start_date; 
        const election_start_time = req.body.election_start_time;
        const election_end_date = req.body.election_end_date; 
        const election_end_time = req.body.election_end_time;
        const start_date_time = election_start_date+" "+election_start_time;
        const end_date_time = election_end_date+" "+election_end_time;
        const status = "On going";
        
        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, data) => {
            if(error) {
                throw error
            } 
            else
            {
                db.query('SELECT * FROM tbl_department', async (err, department) => { 
                    if (err) {
                        console.log(err);
                    } else {
                        db.query('SELECT election_department FROM tbl_election WHERE election_department = ?', [election_department], (err, results) => {

                            if (err) {
                                console.log(err);
                            } else {
                            if (results.length > 0) {
                                res.render("admin/create-election",{
                                    message: election_department+' has already scheduled for election.', userData: data, departmentData: department
                                });
                            } else {
                                 
                                db.query('INSERT INTO tbl_election SET ?', { election_title: election_title, election_department: election_department, election_start_date_time: start_date_time, election_end_date_time: end_date_time, status: status, created_by: id }, (err, results) => {
                                    if(err) {
                                        console.log(err);
                                    } else {
                                        res.render("admin/create-election",{
                                            success: 'Election successfully created for '+election_department+'.', userData: data, departmentData: department
                                        });
                                    }
                        
                                }); 
                            }
                        }
                
                        });
                    }
                });
            }
        });
        
        } else {
            res.redirect("/admin")
        }
}

exports.editelection = async (req, res) =>  {
    
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        const role = decoded.role;
        const election_id = req.body.election_id;

        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, data) => {
            if(error) {
                throw error
            } 
            else
            {
                db.query('SELECT role FROM tbl_users WHERE role = ? ', [role], async (error, results) => {
                    if(error) {
                        throw error
                    } 
                    else
                    {
                        const position = "President"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_voting_transaction WHERE position = ? GROUP BY candidate_id  ', [position], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                db.query('SELECT * FROM tbl_election ORDER BY election_start_date_time', async (error, election) => {
                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                        
                                        db.query('SELECT * FROM tbl_election WHERE id = ? ', [election_id], async (error, editElection) => {
                                            if(error) {
                                                throw error
                                            } 
                                            else
                                            {
                                                var status = editElection[0].status;
                                                if (status == "On going") 
                                                {
                                                    res.render("admin/election-edit", {action: 'list', userData: data, votingData: voting, electionData: election, editElection: editElection, statusOngoing: 'On going'});
                                                }
                                                else if (status == "Expired") {
                                                    res.render("admin/election-edit", {statusExpired: 'Expired'});
                                                }
                                                
                                            }
                                        });  
                                       
                                    }
                                });
                                
                            }
                        });                                
                    }
                });
                
            }
        });
        
        } else {
            res.redirect("/admin")
        }
}

exports.deleteelection = async (req, res) =>  {
    
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        const role = decoded.role;
        const election_id = req.body.election_id;

        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, data) => {
            if(error) {
                throw error
            } 
            else
            {
                db.query('SELECT role FROM tbl_users WHERE role = ? ', [role], async (error, results) => {
                    if(error) {
                        throw error
                    } 
                    else
                    {
                        const position = "President"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_voting_transaction WHERE position = ? GROUP BY candidate_id  ', [position], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                db.query('SELECT * FROM tbl_election WHERE deleted_at IS NULL ORDER BY election_start_date_time', async (error, election) => {
                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                        
                                        db.query('SELECT * FROM tbl_election WHERE id = ? ', [election_id], async (error, editElection) => {
                                            if(error) {
                                                throw error
                                            } 
                                            else
                                            {
                                                res.render("admin/election-delete", {action: 'list', userData: data, votingData: voting, electionData: election, editElection: editElection});
                                                
                                            }
                                        });  
                                       
                                    }
                                });
                                
                            }
                        });                                
                    }
                });
                
            }
        });
        
        } else {
            res.redirect("/admin")
        }
}

exports.delete = async (req, res) => {

    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        const role = decoded.role;
        // res.render("student/vote")
        const election_id = req.body.election_id;
        const dateObject = new Date();
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
            date,
            election_id
        ]
    db.query('UPDATE tbl_election SET deleted_at = ? WHERE id = ?',  param, async (error, results) => {

        if(error) {
            console.log(error);
        } else {
            res.render("admin/election-status", {message: 'Deleted successfully.'});
        }
    });
            
        
    } else {
        res.redirect("/admin")
    }

}

exports.edit = async (req, res) => {
    
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );
        
        const { election_title, election_end_date, election_end_time, election_start_date, election_start_time } = req.body;
        const start_date_time = election_start_date+" "+election_start_time;
        const end_date_time = election_end_date+" "+election_end_time;
        const id = decoded.id;
        const role = decoded.role;
        // res.render("student/vote")
        const election_id = req.body.election_id;
        const dateObject = new Date();
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
            date,
            election_title,
            start_date_time,
            end_date_time,
            election_id
        ]
        
    db.query('UPDATE tbl_election SET updated_at = ?, election_title = ?, election_start_date_time = ?, election_end_date_time = ? WHERE id = ?',  param, async (error, results) => {

        if(error) {
            console.log(error);
        } else {
            res.render("admin/election-status",{message: 'Updated successfully.'});
        }
    });
            
        
    } else {
        res.redirect("/admin")
    }

}

exports.searchcandidate = async (req, res) => {

    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        const role = decoded.role;

        const student_id = req.body.student_id;

        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, userData) => { 

            if(error) {
                throw error
            } 
            else
            {
                db.query('SELECT * FROM tbl_users WHERE student_id = ? ', [student_id], async (error, studentData) => {
                    if(error) {
                        throw error
                    } 
                    else
                    {
                        if (studentData.length > 0) 
                        {
                            db.query('SELECT * FROM tbl_sample_position', async (error, positionData) => {
                                if(error) {
                                    throw error
                                } 
                                else
                                {
                                    db.query('SELECT * FROM tbl_candidate WHERE student_id = ? ', [student_id], async (error, student) => { 

                                        if(error) {
                                            throw error
                                        } 
                                        else
                                        {
                                            if (student.length > 0) 
                                            {
                                                return res.render('admin/add-candidate', { userData: userData, message: 'Candidate already in the list.' });
                                            }
                                            else
                                            {
                                                return res.render('admin/candidate-info', { studentData: studentData, userData: userData, positionData: positionData });
                                            }
                                        }
                                    });
                                    
                                }
                            });
                            
                        }
                        else
                        {
                            
                            return res.render('admin/add-candidate', {
                                message: 'The Student ID is not registered.'
                            });
                        }
                    }
                });
            }
        });
    }
    else
    {
        res.redirect("/admin")
    }
}

exports.addcandidate = async (req, res) => {

    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        const role = decoded.role;

        const { student_id, name, department, position } = req.body;

        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, userData) => { 

            if(error) {
                throw error
            } 
            else
            {
                db.query('SELECT * FROM tbl_candidate WHERE student_id = ? ', [student_id], async (error, studentData) => { 

                    if(error) {
                        throw error
                    } 
                    else
                    {
                        if (studentData.length > 0) 
                        {
                            return res.render('admin/add-candidate', { userData: userData, message: 'Candidate already in the list.' });
                        }
                        else
                        {

                            db.query('INSERT INTO tbl_candidate SET ?', { student_id: student_id, name: name, department: department, position_id: position }, (err, addCandidate) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    return res.render('admin/add-candidate', { userData: userData, success: 'Candidate successfully added.' });
                                }
                            });

                        }
                    }
                });
                
            }
        });

    }
    else
    {
        res.redirect("/admin")
    }
}

exports.validationECDSA = async (req, res) => {

    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );
       
            
        db.query('SELECT ecdsa_sample.private_key, ecdsa_sample.public_key, tbl_sample_voting_ecdsa.user_id, tbl_sample_voting_ecdsa.hash, tbl_sample_voting_ecdsa.candidate_id, tbl_sample_voting_ecdsa.position, tbl_sample_voting_ecdsa.candidate_name, tbl_sample_voting_ecdsa.vote, tbl_sample_voting_ecdsa.status FROM tbl_sample_voting_ecdsa INNER JOIN ecdsa_sample ON ecdsa_sample.id = tbl_sample_voting_ecdsa.user_id', async (error, results) => {

            const enc_sec = process.env.ENC_SECRET;
            const pbkdf2Iterations = parseInt(process.env.pbkdf2Iterations);
            const cryptr = new Cryptr(enc_sec, pbkdf2Iterations);
            
              var startLooping = new Date();
              var sLoop = startLooping.getMilliseconds();
            //   results.length
              for (i=0; i<10; i++) {
        
              const startLooping = new Date();
              const sLoop = startLooping.getMilliseconds();
                    // === start time ===
        
                
                var id = results[i].user_id;
                // console.log(id+ " .......");
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
                        var done = "Done validation"
                        console.log();        
                        console.log("Done Validation...| Total time: "+totaltime+" ms | Average Time: " +(totaltime/results.length)+" ms");
                        var validation_remarks = "Done";
                        const department = req.body.department;
                        
                        db.query('SELECT SUM(time) as time FROM tbl_sample_voting_ecdsa', async (error, time) => {
                            db.query('UPDATE tbl_election SET validation_remarks = ? WHERE election_department = ?',  [validation_remarks, department], async (err, result) => {
                                if(err) {
                                    console.log(err);
                                  }
                                  else
                                  {
                                    var time = ((totaltime)/1000).toFixed(2)+" second(s)";
                                    // var time = (((time[0].time)/1000)/60)+" minute(s)";
                                    const admin_id = decoded.id;
                                    const role = decoded.role;
                                    db.query('SELECT * FROM tbl_users WHERE id = ? ', [admin_id], async (error, userData) => { 

                                        if(error) {
                                            throw error
                                        } 
                                        else
                                        {
                                        res.render("admin/view-results", {action: 'list', data: results, done: done, time: time, userData: userData, department:department });
                                        }
                                    });
                                  }
                            });
                        });
        });        

       

    }
    else
    {
        res.redirect("/admin")
    }
}

exports.validationRSA = async (req, res) => {

    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );
        // const id = decoded.id;
        // const role = decoded.role;

        db.query('SELECT rsa_sample.private_key, rsa_sample.public_key, tbl_sample_voting_rsa.user_id, tbl_sample_voting_rsa.hash, tbl_sample_voting_rsa.candidate_id, tbl_sample_voting_rsa.position, tbl_sample_voting_rsa.candidate_name, tbl_sample_voting_rsa.vote, tbl_sample_voting_rsa.status FROM tbl_sample_voting_rsa INNER JOIN rsa_sample ON rsa_sample.id = tbl_sample_voting_rsa.user_id', async (error, results) => {

            const enc_sec = process.env.ENC_SECRET;
            const pbkdf2Iterations = parseInt(process.env.pbkdf2Iterations);
            const cryptr = new Cryptr(enc_sec, pbkdf2Iterations);
            
              var startLooping = new Date();
              var sLoop = startLooping.getMilliseconds();
              //   results.length
              for (i=0; i<10; i++) {
        
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
                        jwt.verify(signature, public_key, {algorithm: 'RS256'}, function(err, decoded) {
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
                        db.query('UPDATE tbl_sample_voting_rsa SET status = ? WHERE user_id = ?',  [status, id], async (err, result) => {
                            if(err) {
                                console.log(err);
                              }
                        });
                        });
          
                         
                        }
        
                        var endLooping = new Date();
                        var eLoop = endLooping.getMilliseconds();
                        var totaltime = (endLooping-startLooping);
                        var done = "Done validation"
                        console.log();        
                        console.log("Done Validation...| Total time: "+totaltime+" ms | Average Time: " +(totaltime/results.length)+" ms");
                        var validation_remarks = "Done";
                        const department = req.body.department;

                        db.query('SELECT SUM(time) as time FROM tbl_sample_voting_rsa', async (error, time) => {
                            db.query('UPDATE tbl_election SET validation_remarks = ? WHERE election_department = ?',  [validation_remarks, department], async (err, result) => {
                                if(err) {
                                    console.log(err);
                                  }
                                  else
                                  {
                                var time = ((totaltime)/1000).toFixed(2)+" second(s)";
                                // var time = (((time[0].time)/1000)/60)+" minute(s)";
                                const admin_id = decoded.id;
                                const role = decoded.role;
                                db.query('SELECT * FROM tbl_users WHERE id = ? ', [admin_id], async (error, userData) => { 

                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                res.render("admin/view-results-rsa", {action: 'list', data: results, done: done, time: time, userData: userData, department: department });                            
                                    }
                                        });
                                  }
                            });

                    });            
                });

    }
    else
    {
        res.redirect("/admin")
    }
}

exports.validateResultsECDSA = async (req,res) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const department = req.body.department

        const id = decoded.id;
        const role = decoded.role;
        // res.render("student/vote")


        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, data) => {
            if(error) {
                throw error
            } 
            else
            {
                db.query('SELECT role FROM tbl_users WHERE role = ? ', [role], async (error, results) => {
                    if(error) {
                        throw error
                    } 
                    else
                    {
                        db.query('SELECT department FROM tbl_sample_voting_ecdsa WHERE department = ? ', [department], async (error, department) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                const election_department = department[0].department;
                                // console.log(election_department);
                                res.render("admin/validate-result-ecdsa", {departmentData: election_department, userData: data});
                            }
                        });
                    }
                });
            }
        });
        


    }
    else
    {
        res.redirect("/admin")
    }

}

exports.validateResultsRSA = async (req,res) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const department = req.body.department

        const id = decoded.id;
        const role = decoded.role;
        // res.render("student/vote")


        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, data) => {
            if(error) {
                throw error
            } 
            else
            {
                db.query('SELECT role FROM tbl_users WHERE role = ? ', [role], async (error, results) => {
                    if(error) {
                        throw error
                    } 
                    else
                    {
                        db.query('SELECT department FROM tbl_sample_voting_rsa WHERE department = ? ', [department], async (error, department) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                const election_department = department[0].department;
                                // console.log(election_department);
                                res.render("admin/validate-result-rsa", {departmentData: election_department, userData: data});
                            }
                        });
                    }
                });
            }
        });
        


    }
    else
    {
        res.redirect("/admin")
    }

}

exports.generateResultECDSA = async (req,res) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const department = req.body.department

        const enc_sec = process.env.ENC_SECRET;
        const pbkdf2Iterations = parseInt(process.env.pbkdf2Iterations);
        const cryptr = new Cryptr(enc_sec, pbkdf2Iterations);

        const id = decoded.id;
        const role = decoded.role;
        const html = fs.readFileSync(path.join(__dirname, '../views/result/template.html'), 'utf-8');
        const filename = Math.random() + '_doc' + '.pdf';
        let array = [];
        const status = "Valid";
        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, data) => {
            if(error) {
                throw error
            } 
            else
            {

                db.query('SELECT tbl_sample_voting_ecdsa.position, tbl_sample_voting_ecdsa.department, tbl_sample_candidate.candidate_name, COUNT(tbl_sample_voting_ecdsa.candidate_id) AS Votes FROM tbl_sample_voting_ecdsa INNER JOIN tbl_sample_candidate ON tbl_sample_voting_ecdsa.candidate_id = tbl_sample_candidate.id  WHERE tbl_sample_voting_ecdsa.department = ? AND tbl_sample_voting_ecdsa.status = ? GROUP BY tbl_sample_voting_ecdsa.candidate_id ', [department,status], async (error, viewResult) => {
                    if(error) {
                        throw error
                    } 
                    else
                    {                        

                        db.query('SELECT tbl_sample_voting_ecdsa.candidate_id, tbl_sample_candidate.candidate_name, tbl_sample_voting_ecdsa.department, tbl_sample_voting_ecdsa.position, COUNT(tbl_sample_voting_ecdsa.candidate_id) AS Votes FROM tbl_sample_voting_ecdsa INNER JOIN tbl_sample_candidate ON tbl_sample_voting_ecdsa.candidate_id = tbl_sample_candidate.id WHERE tbl_sample_voting_ecdsa.department = ? AND tbl_sample_voting_ecdsa.status = ? GROUP BY tbl_sample_voting_ecdsa.candidate_id ORDER BY Votes DESC;', [department,status], async (error, viewWinner) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {                        

                                const winner = viewWinner[0].candidate_name;
                                const department = viewWinner[0].department;
                                const position = viewWinner[0].position;
                                const candidate_id = viewWinner[0].candidate_id;
                                const candidate_votes = viewWinner[0].Votes;

                                res.render("admin/view-winner-ecdsa", {viewResult: viewResult, userData: data, viewWinner: viewWinner, winner: winner, position: position, department: department, candidate_id:candidate_id, candidate_votes:candidate_votes});
                                // console.log(viewWinner);
                                // console.log(viewResult);
                            }
                        });

                    }
                });

            }
        });
        
    }
    else
    {
        res.redirect("/admin")
    }

}

exports.generateResultRSA = async (req,res) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        

        const enc_sec = process.env.ENC_SECRET;
        const pbkdf2Iterations = parseInt(process.env.pbkdf2Iterations);
        const cryptr = new Cryptr(enc_sec, pbkdf2Iterations);

        const id = decoded.id;
        const role = decoded.role;
        const html = fs.readFileSync(path.join(__dirname, '../views/result/template.html'), 'utf-8');
        const filename = Math.random() + '_doc' + '.pdf';
        let array = [];
        
        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, data) => {
            if(error) {
                throw error
            } 
            else
            {
                const department = req.body.department
                const status = "Valid";
                
                db.query('SELECT tbl_sample_voting_rsa.position, tbl_sample_voting_rsa.department, tbl_sample_candidate.candidate_name, COUNT(tbl_sample_voting_rsa.candidate_id) AS Votes FROM tbl_sample_voting_rsa INNER JOIN tbl_sample_candidate ON tbl_sample_voting_rsa.candidate_id = tbl_sample_candidate.id  WHERE tbl_sample_voting_rsa.department = ? AND tbl_sample_voting_rsa.status = ? GROUP BY tbl_sample_voting_rsa.candidate_id ', [department,status], async (error, viewResult) => {
                    if(error) {
                        throw error
                    } 
                    else
                    {                        

                        db.query('SELECT tbl_sample_voting_rsa.candidate_id, tbl_sample_candidate.candidate_name, tbl_sample_voting_rsa.department, tbl_sample_voting_rsa.position, COUNT(tbl_sample_voting_rsa.candidate_id) AS Votes FROM tbl_sample_voting_rsa INNER JOIN tbl_sample_candidate ON tbl_sample_voting_rsa.candidate_id = tbl_sample_candidate.id WHERE tbl_sample_voting_rsa.department = ? AND tbl_sample_voting_rsa.status = ? GROUP BY tbl_sample_voting_rsa.candidate_id ORDER BY Votes DESC;', [department,status], async (error, viewWinner) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {                        

                                const winner = viewWinner[0].candidate_name;
                                const department = viewWinner[0].department;
                                const position = viewWinner[0].position;
                                const candidate_id = viewWinner[0].candidate_id;
                                const candidate_votes = viewWinner[0].Votes;

                                res.render("admin/view-winner-rsa", {viewResult: viewResult, userData: data, viewWinner: viewWinner, winner: winner, position: position, department: department, candidate_id:candidate_id, candidate_votes:candidate_votes});
                                // console.log(viewWinner);
                                // console.log(viewWinner);
                            }
                        });

                    }
                });

            }
        });
        
    }
    else
    {
        res.redirect("/admin")
    }

}

exports.declarewinnerECDSA = async (req,res) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const department = req.body.candidate_department;
        const position = req.body.candidate_position;
        const name = req.body.candidate_name;
        const candidate_id = req.body.candidate_id;
        const candidate_votes = req.body.candidate_votes;

        const id = decoded.id;
        const role = decoded.role;
        let array = [];
        const status = "Valid";
        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, data) => {
            if(error) {
                throw error
            } 
            else
            {

                        
                        // console.log("Winner Declared!");
                        db.query('SELECT * FROM tbl_winner WHERE candidate_name = ?', [name], async (error, winners) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                if (winners.length > 0) {
                                    db.query('SELECT * FROM tbl_winner ', async (error, winner) => {
                                    res.render("admin/view-candidate-winner",{userData: data, winner:winner, message: "Candidate already in the list."});
                                    });
                                }
                                else
                                {
                                    db.query('INSERT INTO tbl_winner SET ?', { candidate_id: candidate_id, candidate_name: name, candidate_department: department, candidate_position: position, candidate_votes: candidate_votes }, (err, results) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            db.query('SELECT * FROM tbl_winner ', async (error, winner) => {
                                            res.render("admin/view-candidate-winner",{userData: data, winner:winner, success: "Candidate added successfully"});
                                            });
                                        }
                                    });
                                }
                        
                            }
                        });
                

            }
        });
        
    }
    else
    {
        res.redirect("/admin")
    }

}

exports.declarewinnerRSA = async (req,res) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const department = req.body.candidate_department;
        const position = req.body.candidate_position;
        const name = req.body.candidate_name;
        const candidate_id = req.body.candidate_id;
        const candidate_votes = req.body.candidate_votes;

        const id = decoded.id;
        const role = decoded.role;
        let array = [];
        const status = "Valid";
        db.query('SELECT * FROM tbl_users WHERE id = ? ', [id], async (error, data) => {
            if(error) {
                throw error
            } 
            else
            {

                        
                        // console.log("Winner Declared!");
                        db.query('SELECT * FROM tbl_winner WHERE candidate_name = ?', [name], async (error, winners) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                if (winners.length > 0) {
                                    db.query('SELECT * FROM tbl_winner ', async (error, winner) => {
                                    res.render("admin/view-candidate-winner",{userData: data, winner:winner, message: "Candidate already in the list."});
                                    });
                                }
                                else
                                {
                                    db.query('INSERT INTO tbl_winner SET ?', { candidate_id: candidate_id, candidate_name: name, candidate_department: department, candidate_position: position, candidate_votes: candidate_votes }, (err, results) => {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            db.query('SELECT * FROM tbl_winner ', async (error, winner) => {
                                            res.render("admin/view-candidate-winner",{userData: data, winner:winner, success: "Candidate added successfully"});
                                            });
                                        }
                                    });
                                }
                        
                            }
                        });
                

            }
        });
        
    }
    else
    {
        res.redirect("/admin")
    }

}