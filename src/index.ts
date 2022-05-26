import express from 'express';

const App = express();

(async () => {

    App.get("/", (req, res, next) => { res.json("Oui.") })

    App.listen(4200, () => console.log("Serveur ouvert sur http://localhost:4200 !"));

})()
