import { Database } from "sqlite";
import { v4 } from "uuid";
import { AxUsrDB } from "./db";
import { usr_DBobj, usr_Jeton, usr_Jeton_DBobj } from "./utilisateur";
import jwt from "jsonwebtoken";
import ms from "ms";


export class AxUsrDBSQLite implements AxUsrDB {
    
    constructor (private db: Database, private host: string, private uid: string) {

    }

    init (): Promise<boolean> {
        return new Promise(async (res, _) => {
            res(true);
        })
    }

    self(): Promise<usr_DBobj> {
        return new Promise(async (resolve, _) => {
            try {
                let raw = await this.db.get<sqlite_raw_usr>(sqlite_select_usr(this.host), this.uid);
                if (!raw) throw "Erreur Base de données !";               
                resolve(sqlite_parse_usr(raw));
            } catch (error) {
                console.trace(error);
            }
        })
    }

    jetons(): Promise<usr_Jeton[]> {
        return new Promise(async (resovle, _) => {
            let list = await this.db.all<sqlite_usr_Jeton_DBobj[]>(sqlite_usr_jetons_select(this.host), this.uid);
            // let jetons = await Promise.all(list.map(e => this.jeton(e.jeton)));
            let jetons = list.map(e => new usr_Jeton(sqlite_usr_jeton_parse(e), this));
            resovle(jetons);
        })
    }

    jeton (jti: string): Promise<usr_Jeton> {
        return new Promise(async (resolve, reject) => {
            try {
                let raw = await this.db.get<sqlite_usr_Jeton_DBobj>(sqlite_usr_jeton_select(this.host), jti);
                if (!raw) return reject("Erreur base de données");
                let obj = sqlite_usr_jeton_parse(raw);
                resolve(new usr_Jeton(obj, this));
            } catch (err) {
                console.trace(err)
                reject();
            }
        })
    }
    
    set_email (email: string): Promise<boolean> {
        return new Promise(async (resolve, _) => {
            await this.db.exec(sqlite_usr_update(this.host, this.uid, [ "email" ]), email);
            resolve(true)
        })
    };

    set_naissance (naissance: Date): Promise<boolean> {
        return new Promise(async (resolve, _) => {
            await this.db.exec(sqlite_usr_update(this.host, this.uid, [ "naissance" ]), naissance);
            resolve(true)
        })
    };

    set_photo (photo: string): Promise<boolean> {
        return new Promise(async (resolve, _) => {
            await this.db.exec(sqlite_usr_update(this.host, this.uid, [ "photo" ]), photo);
            resolve(true)
         })
    };

    set_mdp (hash: string): Promise<boolean> {
        return new Promise(async (resolve, _) => {
            await this.db.exec(sqlite_usr_update(this.host, this.uid, [ "mdp_hash" ]), hash);
            resolve(true)
        })
    };

    set_roles (roles: string[]): Promise<boolean> {
        return new Promise(async (resolve, _) => {
            await this.db.exec(sqlite_usr_update(this.host, this.uid, [ "roles" ]), roles.join(":"));
            resolve(true)
        })
    };


    add_jeton (agent: string, creation: Date, peremption: Date, scope?: any): Promise<usr_Jeton> {
        return new Promise(async (resolve, _) => {
            let jti = v4();
            
            let tk = jwt.sign({
                jti, iss: this.host,
                sub: this.uid,
                iat: creation.getTime(),
                exp: ms(peremption.getTime() - creation.getTime()),
            }, process.env.AXJWTSECRET || this.uid, { algorithm: "HS512" });

            let raw: usr_Jeton_DBobj = {
                jti, jeton: tk,
                creation, peremption,
                agent
            }

            // Mise en DB
            await this.db.exec(sqlite_usr_jeton_add(this.host), jti, tk, agent, creation.getTime(), peremption.getTime(), this.uid);

            resolve(new usr_Jeton(raw, this));
        })
    };
    
    rm_jeton (jti: string): Promise<boolean> {
        return new Promise(async (resolve, _) => {
            await this.db.exec(sqlite_usr_jeton_rm(this.host), jti);
            resolve(true)
        })
    };

}


export type sqlite_raw_usr = {
    //public
    uid: string;
    id: string;
    email: string;
    naissance: number;
    photo: string;
    nom: string;
    prenom: string;
    //privé
    mdp_hash: string;
    roles: string;
};

export function sqlite_parse_usr (u: sqlite_raw_usr): usr_DBobj {
    return {
        uid: u.uid,
        id: u.id,
        email: u.email,
        naissance: new Date(u.naissance),
        photo: u.photo,
        nom: u.nom,
        prenom: u.prenom,
        //privé
        mdp_hash: u.mdp_hash,
        roles: (u.roles || '').split(":"),
    }
}


export const sqlite_select_usr = (h: string) => 
    `SELECT * FROM d_${h}_utilisateurs WHERE uid = "?";`;

export const sqlite_usr_update = (h: string, uid: string, f: string[]) => 
    `UPDATE d_${h}_utilisateurs_jetons SET ${ f.join(' = ?, ') } WHERE uid = "${uid}";`;

export type sqlite_usr_Jeton_DBobj = {
    jti: string,
    jeton: string;
    agent: string;
    creation: number;
    peremption: number;
}
export function sqlite_usr_jeton_parse (i: sqlite_usr_Jeton_DBobj): usr_Jeton_DBobj {
    return {
        jti: i.jti, agent: i.agent, creation: new Date(i.creation), jeton: i.jeton, peremption: new Date(i.peremption)
    }
}
export const sqlite_usr_jetons_select = (h: string) => 
    `SELECT * FROM d_${h}_utilisateurs_jetons WHERE uid = "?";`;

    
export const sqlite_usr_jeton_select = (h: string) => 
    `SELECT * FROM d_${h}_utilisateurs_jetons WHERE jti = "?";`;

export const sqlite_usr_jeton_add = (h: string) => 
    `INSERT INTO d_${h}_utilisateurs_jetons (jti, jeton, agent, creation, peremption, uid) VALUES ("?", "?", "?", ?, ?, "?");`;

export const sqlite_usr_jeton_rm = (h: string) => 
    `DELETE FROM d_${h}_utilisateurs_jetons WHERE jti = "?";`;