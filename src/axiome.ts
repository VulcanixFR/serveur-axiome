import { open } from "sqlite";
import { Database } from "sqlite3";
import axapp, { app_AUTH_AID } from "./Application/application";
import { AxDB } from "./Base de données/database";
import { AxDBSQLite } from "./Base de données/sqlite";
import { Domaine } from "./Domaine/domaine";
import { usr_AUTH_UID, Utilisateur } from "./Utilisateur/utilisateur";

export const DEF_SECRET = "Frites_au four ! XD @sel"

// Déclaration
declare global {
    namespace Express {
        export interface Request {
            client?: Utilisateur | axapp;
            utilisateur?: Utilisateur;
            // auth?: usr_AUTH_UID | app_AUTH_AID;
            domaine: Domaine;
            axiome: Axiome;
        }
        export interface Response {
            transaction: (valeur: any) => void;
        }
    }
}
// Fin déclaration

export type AxVersion = { nom: string; annee: string; mois: string; jour: string; surnom: string; suffixe?: string; long: () => string; court: () => string };

export const VERSION: AxVersion = { 
    annee: "2022", mois: "06", jour: "05", 
    nom: "Nihil", surnom: "E-Cars", 
    suffixe: "prealpha",
    court: function () { return `${this.annee}.${this.mois}.${this.jour}${this.suffixe ? "." + this.suffixe : ""}` },
    long: function () { return `Axiome-(${this.nom}, ${this.surnom})-${this.court()}` },
};

const db_choix = [ 'sqlite' ];

export type Axiome = {
    port: number;
    version: AxVersion;
    domaines: Domaine[];
    db: AxDB;
};

export async function initAxiome (): Promise<Axiome> {
    
    require('dotenv').config();

    if (!process.env.AXDB || db_choix.indexOf(process.env.AXDB) == -1) {
        console.error("Pas de base de données spécifiée,\npour cela définissez la variable d'environnement\nAXDB=<type> où <type> fait partie de la liste suivante:\n" + db_choix.map(e => " > " + e).join("\n"));
        process.exit(1);
    }

    let db: AxDB;
    switch (process.env.AXDB) {
        case db_choix[0]:
            let tmp = await open({ driver: Database, filename: process.env.AXSQLITEFILE || "data.sqlite" });
            db = new AxDBSQLite(tmp);
            break;
        default:
            throw "Base de données incompatible";
    }
    let ok = await db.init();
    if (!ok) {
        console.error("Problème base de données !")
        process.exit(2);
    }

    let axiome: Axiome = {
        port: parseInt(process.env.AXPORT || "4200"), version: VERSION,
        domaines: [], db
    }

    axiome.domaines = await Promise.all((await db.domaines()).map(e => db.domaine(e.host)));

    return axiome;

}
