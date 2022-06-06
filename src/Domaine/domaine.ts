import { NextFunction, Request, Response } from "express";
import { Axiome } from "../axiome";
import { AxDmnDB } from "./db";

export type dmn_DBobj = {
    host: string;
    alias: string[];
    defaut: boolean;
}

export class Domaine {

    constructor (private dmn: dmn_DBobj, private db?: AxDmnDB) {

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

}

export function domaine_middleware (req: Request, res: Response, next: NextFunction) {
    let doms = req.axiome.domaines.filter(e => e.host == req.hostname || e.alias.indexOf(req.hostname) != -1 || e.defaut );
    doms = doms.sort((a,b) => ( a.defaut && !b.defaut ? 1 : -1 ));
    req.domaine = doms[0];
    next();
}