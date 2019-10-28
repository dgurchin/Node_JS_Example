const sqlite3 = require('sqlite3').verbose();
let db;

let openConnection = function () {
    db = new sqlite3.Database('./db/users.db', (err) => {
        if (err) {
            console.error(err.message);
        }
            console.log('Connected to the users database.');
    });
}


let initDb = function (bCreateNewTable, bInsertTestUser) {
    openConnection();

    if (bCreateNewTable) {
        db.run('CREATE TABLE users(user_id INTEGER PRIMARY KEY, email TEXT, passw TEXT)');
    }
    
    if (bInsertTestUser) {
        db.run(`INSERT INTO users(email, passw) VALUES(?, ?)`, ['test1@sdf.com', '123'], function(err) {
            if (err) {
              return console.log(err.message);
            }
           
            console.log(`A row has been inserted with rowid ${this.lastID}`);
          });
    }
    
    db.close();    
};

let findOne = function (pswd, callback) {
    openConnection();

    let sql = `SELECT user_id,
                      email,
                      passw
               FROM users
               WHERE passw  = ?`,
        resRow = null;

    db.get(sql, [pswd], function (err, row) {
        if (err) {
            console.error(err.message);
        } 

        callback(row);
        db.close();
    });
}

module.exports = {
    'initDb' : initDb,
    'findOne' : findOne
}
