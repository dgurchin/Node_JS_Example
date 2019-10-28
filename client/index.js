const port = 3001,
      pubAnswer = "pub",
      subAnswer = "sub",
      apiIn = "api_in",
      apiOut = "api_out",
      readline = require('readline');

let sockPub,
    sockSub;

(function main () {
    const express = require('express'),
          zmq = require("zeromq"),
          app = express();

    app.listen(port, () => console.log(`Example app listening on port ${port}!`))

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    (makeQuestion = function () {
        rl.question('Type port: ', (answer) => {
        
            switch (answer) {
                case pubAnswer : {
                    sockPub = zmq.socket(pubAnswer);
                    sockPub.bindSync("tcp://127.0.0.1:3001");
                    console.log(`${pubAnswer} connected`);
                    inputCredentials(rl, createRequest);
                    makeQuestion();
                } break;
    
                case subAnswer : {
                    sockSub = zmq.socket(subAnswer);
                    sockSub.connect("tcp://127.0.0.1:3000");
                    console.log(`${subAnswer} connected`);
                    sockSub.subscribe(apiOut);
                    
                    listenSocket(sockSub);
                    makeQuestion();
                } break;
            }
        });
    })();
    
})();

function createRequest (sockPub, credentials) {
    let msg = {
        type: "login",
        email: credentials.login,
        pwd: credentials.password,
        msg_id: Math.round(Math.random() * 1000000)
    }

    sockPub.send([apiIn, JSON.stringify(msg)]);
}

function listenSocket (sockSub) {
    let parsedMsg = null;

    sockSub.on("message", function(topic, message) {
        console.log(`Received: ${message} for ${topic}`);

        if (message) {
            parsedMsg = JSON.parse(message.toString());
        }

        if (parsedMsg.status === "ok") {
            console.log("ok");

        } else if (parsedMsg.status === "error") {
            console.log(parsedMsg.error); 
        }
    });
}

function inputCredentials (rl, callback) {
    
    // const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });

    rl.question('Login: ', (answer) => {
        let credentials = {};
        if (answer) {
            credentials.login = answer;
            rl.question('Password: ', (answer) => {
                if (answer) {
                    credentials.password = answer;
                    callback(sockPub, credentials);
                }
            });
        }
    });
}