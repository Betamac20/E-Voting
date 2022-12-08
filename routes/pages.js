const mysql = require("mysql");
const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();
const dotenv = require("dotenv");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
dotenv.config({ path: './.env' });
const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.ENC_SECRET);
const qr = require('qrcode');
const { stat } = require("fs");

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

router.get('/',authController.isLoggedIn, (req, res) => {
    res.render("index")
});
router.get('/register', async (req, res) => {

    db.query('SELECT * FROM tbl_department', async (err, department) => {

        res.render("register", {departmentData: department});

    });

});
router.get('/login', (req, res) => {
    res.render("login")
});

router.get('/verify', (req, res) => {
    res.render("email/verify-email")
});

router.get('/verify-code', (req, res) => {
    res.render("email/verification-code")
});

// route for vote
router.get('/vote', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        
        // res.render("student/vote")

        db.query('SELECT user_id from tbl_voting_transaction WHERE user_id = ?', [id], async (err, resultID) => {
            if (err) {
                console.log(err);
            } else {
                if (resultID.length > 0) {

                    db.query('SELECT * FROM tbl_users WHERE id = ?', [id], async (error, data) => {
                    
                    res.render("student/vote", { userData: data, alreadyVoted: 'Already Voted'});

                    });

                } else {
                    //
                    db.query('SELECT * FROM tbl_sample_candidate', (error, results) => {

                        if(error) {
                            throw error
                        } 
                        else
                        {
                           
                            db.query('SELECT * FROM tbl_users WHERE id = ?', [id], async (error, data) => {
            
                                res.render("student/vote", {action: 'list', sampleData: results, userData: data, notVoted: 'Not Voted Yet'});
            
                            });
                            
                        }
            
                    });
                }
            }
        });


        
        
    } else {
        res.redirect("login")
    }
});


// route for home
router.get('/home', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        // res.render("student/vote")
        db.query('SELECT * FROM tbl_sample_candidate', (error, results) => {

            if(error) {
                throw error
            } 
            else
            {
                db.query('SELECT * FROM tbl_users WHERE id = ?', [id], async (error, data) => {

                    res.render("student/how-to-vote", {action: 'list', sampleData: results, userData: data});

                });
                
            }

        });
        
    } else {
        res.redirect("login")
    }
});

router.get('/profile', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        // res.render("student/vote")
                db.query('SELECT * FROM tbl_users WHERE id = ?', [id], async (error, data) => {

                    if(error) {
                        throw error
                    } 
                    else
                    {
                        res.render("student/profile", {action: 'list', userData: data});
                    }
                });

        
    } else {
        res.redirect("login")
    }
});

router.get('/ballot', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

        const id = decoded.id;
        // res.render("student/vote")
        
        db.query('SELECT * from tbl_voting_transaction WHERE user_id = ?', [id], async (err, resultID) => {
            if (err) {
                console.log(err);
            } else {
                if (resultID.length > 0) {

                    const dec_candidate_name = cryptr.decrypt(resultID[0].candidate_name);
                    const position = resultID[0].position;
                    const created_at = resultID[0].created_at;
                    const user_id = resultID[0].user_id;
                    const data = resultID[0].hash;
                    const filename = user_id+".png";
                    let stJson = JSON.stringify(data);
                    qr.toFile("public/qrcode/"+filename,stJson, {type: "terminal"}, function(err, code) 
                    {
                      if(err) {
                        console.log("error");
                      } else {
                        db.query('SELECT * FROM tbl_users WHERE id = ?', [id], async (error, data) => {
                            
                            res.render("student/ballot", { userData: data, alreadyVoted: 'Already Voted',  votingData: resultID, candidateName: dec_candidate_name, candidatePosition: position, dateCreated: created_at, filename: filename});
        
                            });
                      }
                      
                    });

                } else {
                    //
                    db.query('SELECT * FROM tbl_users WHERE id = ?', [id], async (error, data) => {

                        if(error) {
                            throw error
                        } 
                        else
                        {

                                    res.render("student/ballot", {action: 'list', userData: data, notVoted: 'Not Voted Yet'});    
                               
                        }
                    });
                }
            }
        });
        
    } else {
        res.redirect("login")
    }
});

//route for admin
router.get('/admin', (req, res) => {
    res.render("admin/login")
});


// route for home admin
router.get('/admin-home', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                        const position = "President"; 
                        const status = "Valid"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote FROM tbl_sample_voting_ecdsa WHERE position = ? AND status = ? GROUP BY candidate_id  ', [position, status], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                db.query('SELECT * FROM tbl_election ORDER BY id DESC LIMIT 3', async (error, election) => {
                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                        if (election.length == 0) {

                                            res.render("admin/index", {action: 'list', userData: data, votingData: voting, noelectionData: 'No scheduled for election.'});

                                        }
                                        else {
                                                
                                                res.render("admin/index", {action: 'list', userData: data, votingData: voting, electionData: election});
                                            
                                        }
                                        
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
});

// route for admin profile
router.get('/admin-profile', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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

                                db.query('SELECT * FROM tbl_voting_transaction ', async (error, voting) => {
                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                        res.render("admin/profile", {action: 'list', userData: data, votingData: voting});
                                    }
                                });                                
                            }
                        });
                        
                    }
                });
            
        
    } else {
        res.redirect("/admin")
    }
});

// route for admin vote
router.get('/admin-view-vote', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                        const position = "President"; 
                        const status = "Valid"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_voting_transaction WHERE position = ? AND status = ? GROUP BY candidate_id  ', [position, status], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                res.render("admin/view-vote", {action: 'list', userData: data, votingData: voting});
                            }
                        });                                
                    }
                });
                
            }
        });
            
        
    } else {
        res.redirect("/admin")
    }
});

// route for admin create election
router.get('/admin-create-election', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                        const position = "President"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_voting_transaction WHERE position = ? GROUP BY candidate_id  ', [position], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                db.query('SELECT * FROM tbl_department', async (err, department) => { 

                                    res.render("admin/create-election", {action: 'list', userData: data, votingData: voting, departmentData: department});

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
});

// route for admin election
router.get('/admin-election', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                        const position = "President"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_voting_transaction WHERE position = ? GROUP BY candidate_id  ', [position], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                db.query('SELECT * FROM tbl_election WHERE deleted_at IS NULL ORDER BY election_end_date_time', async (error, election) => {
                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                        res.render("admin/election", {action: 'list', userData: data, votingData: voting, electionData: election});

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
});

// route for admin election status
router.get('/admin-election-status', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                                        res.render("admin/election-status", {action: 'list', userData: data, votingData: voting, electionData: election});

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
});

// route for admin add candidate
router.get('/admin-add-candidate', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                        const position = "President"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_voting_transaction WHERE position = ? GROUP BY candidate_id  ', [position], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                db.query('SELECT * FROM tbl_department', async (err, department) => { 
                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                        db.query('SELECT * FROM tbl_sample_position', async (err, position) => { 
                                            res.render("admin/add-candidate", {action: 'list', userData: data, votingData: voting, departmentData: department, positionData: position});
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
});

// route for admin add candidate
router.get('/admin-view-candidate', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                        const position = "President"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_voting_transaction WHERE position = ? GROUP BY candidate_id  ', [position], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                db.query('SELECT tbl_candidate.id, tbl_sample_position.position, tbl_candidate.name, tbl_candidate.department, tbl_candidate.student_id FROM tbl_candidate INNER JOIN tbl_sample_position ON tbl_sample_position.id = tbl_candidate.position_id ', async (err, candidateData) => { 
                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                       for (i = 0; i < candidateData.length; i++) {
                                            console.log(candidateData[i].id);
                                       }                                        
                                        db.query('SELECT * FROM tbl_sample_position', async (err, position) => { 
                                            res.render("admin/view-candidate", {action: 'list', userData: data, votingData: voting, candidateData: candidateData, positionData: position});
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
});

// route for admin users
router.get('/admin-view-users', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                        const position = "President"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_voting_transaction WHERE position = ? GROUP BY candidate_id  ', [position], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                const role = "1";
                                db.query('SELECT * FROM tbl_users WHERE role = ?', [role], async (err, candidateData) => { 
                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                    //    for (i = 0; i < candidateData.length; i++) {
                                    //         console.log(candidateData[i].id);
                                    //    }                                        
                                        db.query('SELECT * FROM tbl_sample_position', async (err, position) => { 
                                            if(error) {
                                                throw error
                                            } 
                                            else
                                            {
                                                db.query('SELECT COUNT(*) AS total_users FROM tbl_users WHERE role = ?',[role], async (err, totaluser) => { 
                                                    if(error) {
                                                        throw error
                                                    } 
                                                    else
                                                    {   
                                                        // const totalusers = totaluser[0].total_users;
                                                        // console.log(total_users);
                                                        res.render("admin/view-users", {action: 'list', userData: data, votingData: voting, candidateData: candidateData, positionData: position, totalusers: totaluser});
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
                
            }
        });
            
        
    } else {
        res.redirect("/admin")
    }
});

// route for admin add candidate
router.get('/admin-view-results', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                        const position = "President"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_voting_transaction WHERE position = ? GROUP BY candidate_id  ', [position], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                const status = "Expired";
                                var department = "Sample Department ECDSA"
                                    db.query('SELECT * FROM tbl_sample_voting_ecdsa WHERE department = ? GROUP BY department ', [department], async (err, department) => { 
                                    // db.query('SELECT * FROM tbl_election ', async (err, department) => { 
                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                        var notdone = "Not Done";
                                        db.query('SELECT * FROM tbl_sample_position', async (err, position) => { 
                                            
                                            res.render("admin/view-results", {action: 'list', userData: data, votingData: voting, departmentData: department, positionData: position, notdone: notdone });
 
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
});

// route for admin add candidate
router.get('/admin-view-results-rsa', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                        const position = "President"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_voting_transaction WHERE position = ? GROUP BY candidate_id  ', [position], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                const status = "Expired";
                                // db.query('SELECT * FROM tbl_election WHERE status = ?', [status], async (err, department) => { 
                                    var department = "Sample Department RSA"
                                    db.query('SELECT * FROM tbl_sample_voting_rsa WHERE department = ? GROUP BY department ', [department], async (err, department) => { 
                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                        var notdone = "Not Done";
                                        db.query('SELECT * FROM tbl_sample_position', async (err, position) => { 
                                            res.render("admin/view-results-rsa", {action: 'list', userData: data, votingData: voting, departmentData: department, positionData: position, notdone: notdone});
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
});

// route for admin add position
router.get('/admin-add-position', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                        const position = "President"; 
                        db.query('SELECT *, SUM(vote) AS sum_vote  FROM tbl_voting_transaction WHERE position = ? GROUP BY candidate_id  ', [position], async (error, voting) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                                db.query('SELECT * FROM tbl_department', async (err, department) => { 
                                    if(error) {
                                        throw error
                                    } 
                                    else
                                    {
                                        db.query('SELECT * FROM tbl_sample_position', async (err, position) => { 
                                            res.render("admin/add-position", {action: 'list', userData: data, votingData: voting, departmentData: department, positionData: position});
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
});

// route for admin add position
router.get('/admin-view-candidate-winner', authController.isLoggedIn, async (req, res, next) => {
    if (req.user) {
        const decoded = await promisify(jwt.verify)(req.cookies.userSave,
            process.env.JWT_SECRET
        );

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
                        db.query('SELECT * FROM tbl_winner', async (error, winner) => {
                            if(error) {
                                throw error
                            } 
                            else
                            {
                        res.render("admin/view-candidate-winner", {action: 'list', userData: data, winner: winner});                               
                            }
                        });
                    }
                });
                
            }
        });
            
        
    } else {
        res.redirect("/admin")
    }
});

module.exports = router;