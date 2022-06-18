import { NextFunction, Request, Response } from "express";
import { Utilisateur } from "../Utilisateur/utilisateur";
import { merge_arrays } from "../utils";
import { AxDmnDB, dmn_inscr_mode } from "./db";

export type dmn_DBobj = {
    host: string;
    alias: string[];
    defaut: boolean;
    admin: string;

    //Mode d'inscription
    inscritption: dmn_inscr_mode;

    // Liste des domaines autorisés / bannis
    lieux: string[];
    liste_noire: boolean;

    //Décoration
    accentuation: string;
    image: string;          //URL
    titre: string;
    apropos: string;        //URL

    //Données statiques
    rootfs: string;
}

export class Domaine {

    constructor (private dmn: dmn_DBobj, private db: AxDmnDB) {
        
    }

    get host () {
        return this.dmn.host
    }

    get alias () {
        return this.dmn.alias
    }

    get defaut () {
        return this.dmn.defaut
    }

    get decoration () {
        return {
            accentuation: this.dmn.accentuation,
            image: this.dmn.image,
            titre: this.dmn.titre,
            apropos: this.dmn.apropos
        }
    }

    get admin_id () {
        return this.dmn.admin 
    }

    get inscription () {
        return this.dmn.inscritption;
    }
    get lieux () {
        return this.dmn.lieux;
    }
    get liste_noire () {
        return this.dmn.liste_noire;
    }
    get accentuation () {
        return this.dmn.accentuation;
    }
    get image () {
        return this.dmn.image;
    }
    get titre () {
        return this.dmn.titre;
    }
    get apropos () {
        return this.dmn.apropos;
    }
    get rootfs () {
        return this.dmn.rootfs;
    }

    nombre_utilisateurs (): Promise<number> {
        return this.db.utilisateurs()
    }

    async utilisateur (uid: string): Promise<Utilisateur | undefined> {
        return await this.db.utilisateur(uid);
    }

    lieux_autorise (lieux: string) {
        return (this.dmn.liste_noire && this.dmn.lieux.indexOf(lieux) == -1) || (!this.liste_noire && this.dmn.lieux.indexOf(lieux) != -1)
    }

    aj_alias (al: string[]) {
        this.dmn.alias = merge_arrays(this.dmn.alias, al);
        this.db.set_prop('alias', this.dmn.alias);
    }

    suppr_alias (al: string[]) {
        this.dmn.alias = this.dmn.alias.filter(e => al.indexOf(e) < 0);
        this.db.set_prop('alias', this.dmn.alias);
    }

    set defaut (v: boolean) {
        this.dmn.defaut = v;
        this.db.set_prop("defaut", v);
    }

    set admin_id (v: string) {
        this.dmn.admin = v;
        this.db.set_prop("admin", this.dmn.admin)
    }

    set inscription (v: dmn_inscr_mode) {
        this.dmn.inscritption = v;
        this.db.set_prop('inscription', v);
    }

    aj_lieux (l: string[]) {
        this.dmn.lieux = merge_arrays(this.dmn.lieux, l);
        this.db.set_prop("lieux", this.dmn.lieux)
    }

    suppr_lieux (l: string[]) {
        this.dmn.lieux = this.dmn.lieux.filter(e => l.indexOf(e) < 0);
        this.db.set_prop("lieux", this.dmn.lieux)
    }

    set liste_noire (v: boolean) {
        this.dmn.liste_noire = v;
        this.db.set_prop("liste_noire", v);
    }

    set accentuation (a: string) {
        this.dmn.accentuation = a;
        this.db.set_prop("accentuation", a);
    }

    set image (i: string) {
        this.dmn.image = i;
        this.db.set_prop('image', i);
    }

    set titre (t: string) {
        this.dmn.titre = t;
        this.db.set_prop("titre", t);
    }

    set apropos (url: string) {
        this.dmn.apropos = url;
        this.db.set_prop("apropos", url);
    }

    set rootfs (r: string) {
        this.dmn.rootfs = r;
        this.db.set_prop("rootfs", r);
    }


    // Supprime le domaine
    supprime () {
        this.db.supprime();
    }

}

export function domaine_middleware (req: Request, res: Response, next: NextFunction) {
    let doms = req.axiome.domaines.filter(e => e.host == req.hostname || e.alias.indexOf(req.hostname) != -1 || e.defaut );
    doms = doms.sort((a,b) => ( a.defaut && !b.defaut ? 1 : -1 ));
    req.domaine = doms[0];
    next();
}