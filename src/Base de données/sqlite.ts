import { Database } from "sqlite";
import { dmn_DBobj, Domaine } from "../Domaine/domaine";
import { AxDmnDBSQlite } from "../Domaine/sqlite";
import { Utilisateur } from "../Utilisateur/utilisateur";
import { AxDB } from "./database";

export class AxDBSQLite implements AxDB {

    constructor (private db: Database) {
        
    }

    init(): Promise<boolean> {
        return new Promise (async (resolve, _) => {
            try {
                console.log("Démarrage de la base de données")
                console.log("Vérification des tables")
                let tables = await this.db.all<{name: string}[]>(table_liste);
                let tables_noms = tables.map(e => e.name);
    
                if (tables_noms.indexOf("domaines") == -1) {    // Initilaisation du fichier
                    console.log("Initialisation des domaines")
                    await this.db.exec(table_domaine);
                    await this.db.exec(domaine_localhost)
                }
                
                let domaines = await this.domaines(); // Initialisation des domaines
                for (let d of domaines) {
                    if (tables_noms.indexOf(`d_${d.host}_utilisateurs`) == -1) {
                        console.log("Création des tables pour le domaine " + d.host);
                        await this.db.exec(tables_domaine(d.host));
                        let admin = domaine_admin(d.host)
                        console.log(admin)
                        await this.db.exec(admin);
                    }
                }
                console.log("Vérification terminée");
                resolve(true);     
            } catch (e) {
                console.trace(e);
                resolve(false)
            }
        });
    }

    domaines(): Promise<dmn_DBobj[]> {
        return new Promise (async (resolve, _) => {
            let d = await this.db.all<raw_dmn[]>(select_tous_domaines);
            resolve(d.map(parse_dmn));
        })
    }

    domaine(host: string): Promise<Domaine> {
        return new Promise(async (resolve, _) => {
            let d = await this.db.get<raw_dmn>(select_domaine, host);
            if (!d) throw "Hôte invalide !";

            let db_obj: dmn_DBobj = parse_dmn(d);  
            let dmndb = new AxDmnDBSQlite(this.db, host);
            resolve(new Domaine(db_obj, dmndb));
        })
    }

}

const table_liste = `SELECT name FROM sqlite_schema WHERE type='table' ORDER BY name;`;
const select_tous_domaines = 'SELECT * FROM domaines;';
const select_domaine = 'SELECT * FROM domaines WHERE host = ?;';

const table_domaine = `CREATE TABLE domaines (
    host TEXT PRIMARY KEY,
    alias TEXT,
    defaut INTEGER DEFAULT 0,
    admin TEXT DEFAULT "admin",
    inscription TEXT DEFAULT "code",
    lieux TEXT,
    liste_noire INTEGER DEFAULT 1,
    accentuation TEXT,
    image TEXT,
    titre TEXT,
    apropos TEXT
);`;
const domaine_localhost = `INSERT INTO domaines (host, alias, defaut) VALUES ("localhost", "127.0.0.1", 1);`;
const domaine_admin = (host: string) => `INSERT INTO d_${host}_utilisateurs (uid, id, email, naissance, prenom) VALUES ("${Utilisateur.gen_uid()}", "admin", "${'admin@' + host}", ${Date.now()}, "Administrateur");`;

const table_domaine_utilisateur = `CREATE TABLE d_$1_utilisateurs (
    uid TEXT PRIMARY KEY,
    id TEXT NOT NULL,
    email TEXT NOT NULL,
    naissance INTEGER NOT NULL,
    prenom TEXT NOT NULL,
    nom TEXT,
    photo TEXT,
    mdp_hash TEXT,
    roles TEXT
);
`;

const table_domaine_utilisateur_jetons = `CREATE TABLE d_$1_utilisateurs_jetons (
    jti TEXT PRIMARY KEY,
    jeton TEXT NOT NULL,
    agent TEXT,
    creation INTEGER NOT NULL,
    peremption INTEGER NOT NULL,
    uid TEXT NOT NULL
);
`;

const table_domaine_inscription_codes = `CREATE TABLE d_$1_inscription_codes (
    code TEXT PRIMARY KEY,
    par TEXT NOT NULL,
    cree INTEGER NOT NULL,
    peremption INTEGER DEFAULT -1,
    max_util INTEGER DEFAULT -1
);`;

function tables_domaine (domaine: string) {
    return (table_domaine_utilisateur + table_domaine_utilisateur_jetons + table_domaine_inscription_codes).replace(/\$1/g, domaine);
}

type raw_dmn = {
    host: string;
    alias: string;
    defaut: number;
    admin: string;

    //Mode d'inscription
    inscritption: 'ouvert' | 'code' | 'liste';

    // Liste des domaines autorisés / bannis
    lieux: string;
    liste_noire: number;

    //Décoration
    accentuation: string;
    image: string;          //URL
    titre: string;
    apropos: string;
}

function parse_dmn (d: raw_dmn): dmn_DBobj {
    return {
        host: d.host,
        alias: d.alias.split(":"),
        defaut: d.defaut == 1,
        inscritption: d.inscritption,
        accentuation: d.accentuation,
        apropos: d.apropos,
        image: d.image,
        lieux: (d.lieux || '').split(":"),
        liste_noire: d.liste_noire == 1,
        titre: d.titre,
        admin: d.admin
    }
}