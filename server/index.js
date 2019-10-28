const port = 3000,
      db = require("./dataBase.js"),
      pubAnswer = "pub",
      subAnswer = "sub",
      apiIn = "api_in",
      apiOut = "api_out",
      wrongPswd = "WRONG_PWD",
      wrongFormat = "WRONG_FORMAT";

let sockPub,
    sockSub;

(function main () {
    const express = require('express'),
          readline = require('readline'),
          zmq = require("zeromq"),
          app = express();

    app.listen(port);

    //db.initDb();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    (makeQuestion = function (bClose) {
        rl.question('Type port: ', (answer) => {
        
            switch (answer) {
                case pubAnswer : {
                    sockPub = zmq.socket(pubAnswer);
                    sockPub.bindSync("tcp://127.0.0.1:3000");
                    console.log(`${pubAnswer} connected`);

                    if (bClose) {
                        rl.close();
                    } else {
                        makeQuestion(true);
                    }
                } break;
    
                case subAnswer : {
                    sockSub = zmq.socket(subAnswer);
                    sockSub.connect("tcp://127.0.0.1:3001");
                    console.log(`${subAnswer} connected`)
                    sockSub.subscribe(apiIn);

                    listenSocket(sockSub);
                    
                    if (bClose) {
                        rl.close();
                    } else {
                        makeQuestion(true);
                    }
                } break;
                
                case "exit" : rl.close();
                break;
            }
        });
    })();
    
})();

function createResponse (sockPub, message) {
    sockPub.send([apiOut, JSON.stringify(message)]);
}

function listenSocket (sockSub) {
    let parsedMsg = null,
        resp = null;

    sockSub.on("message", function(topic, message) {
        console.log(`Received: ${message} for ${topic}`);

        if (message) {
            parsedMsg = JSON.parse(message.toString());
        }
        
        if (parsedMsg.type === "login") {
            db.findOne(parsedMsg.pwd, function(row) {
                if (row) {
                    resp = {
                        msg_id: parsedMsg.msg_id,
                        user_id: row.user_id,
                        status:  "ok"
                    }
    
                } else {
                    let error;
    
                    if (!parsedMsg.email || !parsedMsg.pwd, !parsedMsg.msg_id) {
                        error = wrongFormat;
                    } else {
                        error = wrongPswd;
                    }
    
                    resp = {
                        msg_id: parsedMsg.msg_id,
                        status: "error",
                        error:  error
                    }
                }

                createResponse(sockPub, resp);
            });
        }
    });
}