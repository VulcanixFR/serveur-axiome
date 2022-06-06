import { Database } from "sqlite";
import { Axiome } from "../axiome";
import { dmn_DBobj, Domaine } from "../Domaine/domaine";
import { AxDB } from "./database";

export class AxDBSQLite implements AxDB {

    ok: boolean = false;

    constructor (private db: Database) {
        
    }

    init(): Promise<boolean> {
        return new Promise (async (resolve, _) => {
            console.log("Démarrage de la base de données")
            console.log("Vérification des tables")
            let tables = await this.db.all<{name: string}[]>(table_liste);
            let tables_noms = tables.map(e => e.name);

            if (tables_noms.indexOf("domaines") == -1) {
                console.log("Initialisation des domaines")
                await this.db.exec(table_domaine);
                await this.db.exec(domaine_localhost)
            }
            
            let domaines = await this.domaines();
            for (let d of domaines) {
                if (tables_noms.indexOf(`d_${d.host}_utilisateurs`) == -1) {
                    console.log("Création des tables pour le domaine " + d.host);
                    await this.db.exec(tables_domaine(d.host));
                }
            }

            console.log("Vérification terminée");

            resolve(true); 
        });
    }

    domaines(): Promise<dmn_DBobj[]> {
        return new Promise (async (resolve, _) => {
            let d = await this.db.all<{host: string, alias: string, defaut: number}[]>(select_tous_domaines);
            resolve(d.map(e => ({ host: e.host, alias: e.alias.split(":"), defaut: e.defaut == 1 })));
        })
    }

    domaine(host: string): Promise<Domaine> {
        return new Promise(async (resolve, _) => {
            let d = await this.db.get<{host: string, alias: string, defaut: number}>(select_domaine, host);
            if (!d) throw "Hôte invalide !";

            let db_obj: dmn_DBobj = { host: d.host, alias: d.alias.split(":"), defaut: d.defaut == 1 };
            
            resolve(new Domaine(db_obj));

        })
    }

}

const table_liste = `SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name;`;
const select_tous_domaines = 'SELECT * FROM domaines;';
const select_domaine = 'SELECT * FROM domaines WHERE host = ?;';

const table_domaine = `CREATE TABLE domaines (
    host TEXT PRIMARY KEY,
    alias TEXT,
    defaut INTEGER DEFAULT 0

);`;
const domaine_localhost = `INSERT INTO domaines (host, alias, defaut) VALUES ("localhost", "127.0.0.1", 1);`;

const table_domaine_utilisateur = `CREATE TABLE d_$1_utilisateurs (
    uid TEXT PRIMARY KEY,
    id TEXT NOT NULL,
    email TEXT NOT NULL,
    naissance INTEGER NOT NULL,
    photo TEXT,
    mdp_hash TEXT,
    roles TEXT
);
`;

const table_domaine_utilisateur_jetons = `CREATE TABLE d_$1_utilisateurs_jetons (
    jeton TEXT PRIMARY KEY,
    agent TEXT,
    creation INTEGER NOT NULL,
    peremption INTEGER NOT NULL,
    uid TEXT NOT NULL
);
`;

function tables_domaine (domaine: string) {
    return (table_domaine_utilisateur + table_domaine_utilisateur_jetons).replace(/\$1/g, domaine);
}