const mysql = require("mysql");
const dotenv = require("dotenv");
const schedule = require('node-schedule');
dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

schedule.scheduleJob('*/30 * * * * *', () => {

    const date = new Date();
  
  db.query('SELECT * FROM tbl_election WHERE election_end_date_time < ?', [date], async (error, results) => {
  
    if(error) {
        console.log(error);
    } else {
  
      for (i=0; i < results.length; i++) {
        // 
        const id = results[i].id;
        const status = "Expired";
        db.query('UPDATE tbl_election SET status = ? WHERE id = ?',  [status, id], async (error, results) => {
  
          if(error) {
              console.log(error);
          } 
      });
      }
      
      console.log("Election status updated every 30s...");
  
    }
  });
   
  });


