import { app_AUTH_AID } from "./Application/application";
import { Domaine } from "./Domaine/domaine";
import { usr_AUTH_UID, Utilisateur } from "./Utilisateur/utilisateur";

// Déclaration
declare global {
    namespace Express {
        export interface Request {
            utilisateur?: Utilisateur;
            auth?: usr_AUTH_UID | app_AUTH_AID;
            domaine: Domaine;
            axiome: Axiome;
        }
    }
}
// Fin déclaration

export type AxVersion = { nom: string; annee: string; mois: string; jour: string; surnom: string; suffixe?: string; long: () => string; court: () => string };

export const VERSION: AxVersion = { 
    annee: "2022", mois: "06", jour: "05", 
    nom: "Nihil", surnom: "Green Bike Co.", 
    suffixe: "prealpha",
    court: function () { return `${this.annee}.${this.mois}.${this.jour}${this.suffixe ? "." + this.suffixe : ""}` },
    long: function () { return `Axiome-(${this.nom}, ${this.surnom})-${this.court()}` },
};

const db_choix = [ 'sqlite' ];

export type Axiome = {
    port: number;
    version: AxVersion;
    domaines: Domaine[];
};

export async function initAxiome (): Promise<Axiome> {
    
    require('dotenv').config();

    if (!process.env.AXDB || db_choix.indexOf(process.env.AXDB) == -1) {
        console.error("Pas de base de données spécifiée,\npour cela définissez la variable d'environnement\nAXDB=<type> où <type> fait partie de la liste suivante:\n" + db_choix.map(e => " > " + e).join("\n"));
        process.exit(1);
    }

    let axiome: Axiome = {
        port: parseInt(process.env.AXPORT || "4200"), version: VERSION,
        domaines: []
    }

    axiome.domaines.push(new Domaine({ alias: [ "127.0.0.1" ], host: 'localhost' }, axiome, true))

    return axiome;

}
