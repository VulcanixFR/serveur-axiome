import express from 'express';
import { transaction_middleware } from './Transaction/transaction';
import { initAxiome } from './axiome';
import { domaine_middleware } from './Domaine/domaine';
import bodyParser from "body-parser";

const App = express();
console.log("Bonjour !");

(async () => {

    const Axiome = await initAxiome();

    // App.use(bodyParser);

    App.use((req, res, next) => {
        req.axiome = Axiome;
        res.setHeader("X-Powered-By", Axiome.version.long());
        next();
    }, domaine_middleware, /*auth_middleware,*/ transaction_middleware);

    App.use("/static", express.static("static"))

    App.get("/", (req, res, next) => { 
        res.transaction("Oui.")
    })

    App.get('/test/admin', async (req, res, next) => {
        let admin = await req.domaine.utilisateur(req.domaine.admin_id);
        
        if (!admin) res.status(500);
        res.transaction(admin?.brut || "Erreur");
    })

    App.get('/test/admin/mdp', async (req, res, next) => {
        let admin = await req.domaine.utilisateur(req.domaine.admin_id);
        
        if (!admin || !req.query.val) {
            res.status(404).transaction(false);
            return next();
        }

        await admin.set_mdp(<string>req.query.val);

        res.transaction(true);
    })

    App.get('/test/admin/co', async (req, res, next) => {
        let admin = await req.domaine.utilisateur(req.domaine.admin_id);
        
        if (!admin || !req.query.val) {
            res.status(404).transaction(false);
            return next();
        }

        let j = await admin.connecte(<string>req.query.val, req.headers['user-agent'] || "Inconnu");

        if (!j) res.status(403);
        res.transaction(j?.jeton || "Erreur");
    })

    App.get('/test/:uid/jetons', async (req, res, next) => {

        let usr = await req.domaine.utilisateur(req.params.uid);
        if (!usr) {
            res.status(404).transaction("Inconnu au bataillon")
            return next()
        }
        let js = await usr.connexions();
        res.transaction(js);

    });


    App.listen(Axiome.port, () => console.log(`Serveur ouvert sur http://localhost:${Axiome.port} !`));

})()
