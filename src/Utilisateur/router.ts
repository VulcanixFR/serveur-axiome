import { NextFunction, Request, Response, Router } from "express";
import { verify } from "jsonwebtoken";
import { DEF_SECRET } from "../axiome";
import { Utilisateur } from "./utilisateur";

const RU: Router = Router();

// Util
function auth (req: Request, res: Response, next: NextFunction) {

    let header = req.headers.authorization;
    let erreur = () => res.status(401).transaction("Demande invalide.");

    if (header) {
        let token = header.split(" ")[1];
        verify(token, process.env.AXJWTSECRET || DEF_SECRET, async (err, decoded) => {
            if (err) {

                res.status(400).transaction("<jwt> " + err.message);
                return;
    
            }
            if (decoded) {

                let sub = <string>decoded.sub;
                if (!sub) {
                    res.status(401).transaction("Jeton invalide.")
                    return;
                }

                if (Utilisateur.est_uid(sub)) {
                    req.client = await req.domaine.utilisateur(sub);
                    
                    if (!req.client) return res.status(400).transaction("Client introuvable.");
                    next();
                } else if (false) {
                    // Application
                } else {
                    res.status(400).transaction("Identité invalide.");
                    return;
                }
    
                erreur();
            }
    
            erreur();
    
        });
    }

    erreur();

}

async function get_utilisateur (req: Request, res: Response, next: NextFunction) {

    if (!req.params.uid || !req.client) 
        return res.status(418).transaction("Ce n'était pas censé arriver :/");

    if (req.client.uid && req.client.uid != req.params.uid) 
        return res.status(403).transaction("Vous ne pouvez pas atteindre les informations d'un autre.");

    req.utilisateur = await req.domaine.utilisateur(req.params.uid);

    if (!req.utilisateur) 
        return res.status(404).transaction("Utilisateur inconnu.");

    next();

}

async function TODO (req: Request, res: Response) {
    res.status(501).transaction("Pas implémenté.");
}
//Routes

// Inscritpion
RU.post("/i", TODO); // Inscription

RU.get("/i/dispo/id/:id", TODO);
RU.get("/i/dispo/email/:email", TODO);
RU.get("/i/dispo/code/:code", TODO); //i.e. l'utilisateur peut utiliser le code d'invitation

// Connexion
RU.post("/c", TODO); // Connexion
RU.get('/c/valide', TODO); // Permet de vérifier l'état du jeton actuel

// Publique
RU.get("/pub/:uid", TODO); // Infos publiques { pseudo: pseudo || patronyme, id, photo }


// A partir d'ici, il faut être connecté
RU.use(auth);

//Infos brutes <déterminées par le "scope", à faire plus tard>
RU.get('/:uid', get_utilisateur, (req, res) => {
    let usr = <Utilisateur>req.utilisateur;
    res.transaction(usr.brut);
});

//Recherche partielle 
RU.get("/r/:id", TODO)

//Recherche directe
RU.get("/r/:id/uid", async (req, res) => {
    let usr = await req.domaine.utilisateur(req.params.id);
    if (!usr) 
        return res.status(404).transaction("Utilisateru inconnu.");

    res.transaction(usr.uid);
});

// Vérification


// Suppression


// Modification


export default RU;
