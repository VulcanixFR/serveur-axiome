import express, { NextFunction, Request, Response } from "express";
import { app_AUTH_AID } from "../Application/application";
import { AxVersion } from "../axiome";
import { Domaine } from "../Domaine/domaine";
import { usr_AUTH_UID } from "../Utilisateur/utilisateur";

type transaction<T> = {
    "@axiome": {
        version: AxVersion;
        domaine: string;
        decoration: Domaine["decoration"];
        pour: usr_AUTH_UID | app_AUTH_AID;
        cree: Date;
    },
    valeur: T
} | {
    "@axiome": {
        version: AxVersion; 
        domaine: string;
        decoration: Domaine["decoration"];
        anonyme: true; 
    },
    valeur: T
};

export default function Transaction<T> (valeur: T, domaine: Domaine, version: AxVersion, pour: usr_AUTH_UID | app_AUTH_AID | undefined): transaction<T> {
    if (pour === undefined) {
        return {
            "@axiome": {
                anonyme: true, cree: new Date(), version, domaine: domaine.host, decoration: domaine.decoration
            },
            valeur
        }
    }
    return {
        "@axiome": {
            cree: new Date(), version, pour, domaine: domaine.host, decoration: domaine.decoration
        },
        valeur
    }
}

export function transaction_middleware (req: Request, res: Response, next: NextFunction) {
    res.transaction = function (valeur: any) { this.json(Transaction(valeur, req.domaine, req.axiome.version, req.auth)) }
    next();
}