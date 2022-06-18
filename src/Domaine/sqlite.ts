import { Database } from "sqlite";
import { rm_domaine_db } from "../Base de données/sqlite";
import { AxUsrDBSQLite, sqlite_parse_usr, sqlite_raw_usr, sqlite_select_usr } from "../Utilisateur/sqlite";
import { usr_DBobj, Utilisateur } from "../Utilisateur/utilisateur";
import { AxDmnDB, dmn_inscr_mode, dmn_props } from "./db";

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


    async set_prop(prop: "alias", value: string[]): Promise<boolean>;
    async set_prop(prop: "defaut", value: boolean): Promise<boolean>;
    async set_prop(prop: "admin", value: string): Promise<boolean>;
    async set_prop(prop: "inscription", value: dmn_inscr_mode): Promise<boolean>;
    async set_prop(prop: "lieux", value: string[]): Promise<boolean>;
    async set_prop(prop: "liste_noire", value: boolean): Promise<boolean>;
    async set_prop(prop: "accentuation", value: string): Promise<boolean>;
    async set_prop(prop: "image", value: string): Promise<boolean>;
    async set_prop(prop: "titre", value: string): Promise<boolean>;
    async set_prop(prop: "apropos", value: string): Promise<boolean>;
    async set_prop(prop: "rootfs", value: string): Promise<boolean>;
    async set_prop(prop: dmn_props, value: string | string[] | boolean): Promise<boolean> {
        let tostore = "";
        switch (prop) {
            case "accentuation":
            case "admin":
            case "inscription":
            case "image":
            case "titre":
            case "apropos":
            case "rootfs":
                tostore = '"' + <string>value + '"';
                break;
            case "alias":
            case "lieux":
                tostore = '"' + (<string[]>value).join(":") + '"';
                break;
            case "liste_noire":
                tostore = (<boolean>value) ? '1' : '0';
        }
        try {
            await this.db.exec(sqlite_update(this.host, prop, tostore));
            return true;
        } catch (err) {
            console.trace(err);
            return false;
        }
    }

    async supprime(): Promise<boolean> {
        
        try {
            await this.db.exec(rm_domaine_db(this.host));
            return true;
        } catch (err) {
            console.trace(err);
            return false;
        }

    }

}

const select_count = (h: string) => 
    `SELECT COUNT(*) FROM d_${h}_utilisateurs;`;

const sqlite_update = (h: string, key: string, val: string) => 
    `UPDATE domaines SET ${ key } = ${ val } WHERE host = "${h}";`;
