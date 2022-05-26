import express from 'express';
import Transaction from './Transaction/transaction';

const App = express();

const dummy_usr: usr_AUTH_UID = [ "0", "abcdeffghijklmnopqrstvwxyz", "dummy" ];

(async () => {

    App.use("/static", express.static("static"))

    App.get("/", (req, res, next) => { 
        let T = Transaction("Oui", "localhost", "non-existante", undefined);
        res.json(T) 
    })

    App.listen(4200, () => console.log("Serveur ouvert sur http://localhost:4200 !"));

})()
