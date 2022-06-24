import { NextFunction, Request, Response, Router } from "express";
import { sign, verify } from "jsonwebtoken";
import ms from "ms";
import { DEF_SECRET } from "../axiome";

function admin_existe (req: Request, res: Response, next: NextFunction) {
    if (process.env.AXADMIN) return next();
    res.status(503).transaction("Pas de mot de passe administrateur défini.")
}

function adminjwt (): string {
    let now = Date.now();
    
    return sign({         
        iss: "Axiome",
        sub: "Admin",
        iat: now,
        exp: now + ms("10m"),
    }, <string>process.env.AXADMIN, { algorithm: "HS512" })
}

function auth (req: Request, res: Response, next: NextFunction) {

    let header = req.headers.authorization;
    let erreur = (msg: string) => res.status(401).transaction("Demande invalide: " + msg + ".");

    if (!header) return erreur("Pas de Header");

    let tk = header.split(" ")[1];
    verify(tk, <string>process.env.AXADMIN, (err, jwt) => {

        if (err) return erreur(err.message);
        if (!jwt) return erreur("Pas de données");

        next();

    } );

}

export const AR: Router = Router();

AR.use(admin_existe);

AR.get("/key", (req, res) => {
    let header = req.headers.authorization;
    if (!header) return res.status(403).transaction("Identité invalide.");
    let mdp = header.split(" ")[1];
    if (mdp != process.env.AXADMIN) return res.status(401).transaction("Mot de passe invalide.");
    res.transaction(adminjwt());
})

AR.use(auth);



export default AR;