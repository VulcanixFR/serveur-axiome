import express from 'express';
import Transaction from './Transaction/transaction';
import { initAxiome } from './axiome';
import { domaine_middleware } from './Domaine/domaine';

const App = express();

(async () => {

    const Axiome = await initAxiome();

    App.use((req, res, next) => {
        req.axiome = Axiome;
        res.setHeader("X-Powered-By", Axiome.version.long());
        next();
    }, domaine_middleware);

    App.use("/static", express.static("static"))

    App.get("/", (req, res, next) => { 
        let T = Transaction("Oui", req.domaine.host, Axiome.version.court(), undefined);
        res.json(T) 
    })

    App.listen(Axiome.port, () => console.log(`Serveur ouvert sur http://localhost:${Axiome.port} !`));

})()
