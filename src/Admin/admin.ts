import { NextFunction, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
import ms from "ms";
import { DEF_SECRET } from "../axiome";

function adminjwt (): string {
    let now = Date.now();
    
    return sign({         
        iss: "Axiome",
        sub: "Admin",
        iat: now,
        exp: now + ms("10m"),
    }, process.env.AXJWTSECRET || DEF_SECRET, { algorithm: "HS512" })
}

function auth (req: Request, res: Response, next: NextFunction) {

    let header = req.headers.authorization;
    let erreur = (msg: string) => res.status(401).transaction("Demande invalide: " + msg + ".");

    if (!header) return erreur("Pas de Header");

    let tk = header.split(" ")[1];
    verify(tk, process.env.AXJWTSECRET || DEF_SECRET, (err, jwt) => {

        if (err) return erreur(err.message);
        if (!jwt) return erreur("Pas de données");

        next();

    } );

}

