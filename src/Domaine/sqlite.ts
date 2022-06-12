import { Database } from "sqlite";
import { AxUsrDBSQLite, sqlite_parse_usr, sqlite_raw_usr, sqlite_select_usr } from "../Utilisateur/sqlite";
import { usr_DBobj, Utilisateur } from "../Utilisateur/utilisateur";
import { AxDmnDB } from "./db";

export class AxDmnDBSQlite implements AxDmnDB {

    constructor (private db: Database, private host: string) {

    }

    init (): Promise<boolean> {
        return new Promise(async (res, _) => {
            res(true);
        })
    }

    utilisateurs(): Promise<number> {
        return new Promise(async (resolve, _) => {
            try {
                let tmp = await this.db.get<{ ["COUNT(*)"]: number }>(select_count(this.host));
                let n = tmp ? tmp["COUNT(*)"] : -2;
                resolve(n);
            } catch (e) {
                console.trace(e);
                resolve(-1)
            }
        })
    }

    utilisateur(uid: string): Promise<Utilisateur|undefined> {
        return new Promise (async (resolve, _) => {
            try {
                let raw = await this.db.get<sqlite_raw_usr>(sqlite_select_usr(this.host, uid));
                if (!raw) return resolve(undefined);
                let db_obj = sqlite_parse_usr(raw);
                let usrdb = new AxUsrDBSQLite(this.db, this.host, db_obj.uid);
                resolve(new Utilisateur(db_obj, usrdb, this.host));
            } catch (error) {
                console.trace(error);
                resolve(undefined);
            }
        })
    }

}

const select_count = (h: string) => 
    `SELECT COUNT(*) FROM d_${h}_utilisateurs;`;


