import express, { NextFunction, Request, Response } from "express";
import { Application, app_AUTH_AID } from "../Application/application";
import { AxVersion } from "../axiome";
import { Domaine } from "../Domaine/domaine";
import { usr_AUTH_UID, Utilisateur } from "../Utilisateur/utilisateur";

type transaction<T> = {
    "@axiome": {
        version: AxVersion;
        domaine: string;
        decoration: Domaine["decoration"];
        pour: string;
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

export default function Transaction<T> (valeur: T, domaine: Domaine, version: AxVersion, pour?: Utilisateur | Application): transaction<T> {
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
            cree: new Date(), version, pour: (pour._ax_type == "Utilisateur" ? pour.uid : pour.aid), domaine: domaine.host, decoration: domaine.decoration
        },
        valeur
    }
}

export function transaction_middleware (req: Request, res: Response, next: NextFunction) {
    res.transaction = function (valeur: any) { this.json(Transaction(valeur, req.domaine, req.axiome.version, req.client)) }
    next();
}