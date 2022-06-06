import * as jose from "jose";

export type usr_AUTH_UID = [ string, string, string ]; // [ uid, jeton, hote ]

export type usr_scope = {

}

export type usr_DBobj = {
    //public
    uid: string;
    id: string;
    email: string;
    naissance: Date;
    photo: string;
    //privé
    mdp_hash: string;
    jetons: usr_Jeton_DBobj[];
};

export class Utilisateur {

    private jetons: usr_Jeton[] = [];

    constructor (private db_obj: usr_DBobj, private domaine: any) {
        
    }

    get uid () {
        return this.db_obj.uid
    }

    get id () {
        return this.db_obj.id
    }

    get email () {
        return this.db_obj.email
    }

    get naissance () {
        return this.db_obj.naissance
    }

    get photo () {
        return this.db_obj.photo
    }

    /**
     * Si le mot de passe concorde, crée un jeton (jwt) pour l'utilisateur 
     * @param mdp: mot de passe
     * @returns Jeton de connextion (ou undefined)
     */
    async connecte (mdp: string): Promise<usr_Jeton | undefined> {
        if (this.db_obj.mdp_hash != mdp) return undefined;

        return undefined
    }

    /**
     * 
     * @param jeton (JWT)
     * @returns Le jeton est valide et appartient à l'utilisateur
     */
    verifie (jeton: string): boolean {

        return false
    }

}


export type usr_Jeton_DBobj = {
    jeton: string;
    agent: string;
    creation: Date;
    peremption: Date;
}

export class usr_Jeton {

    constructor (private db_obj: usr_Jeton_DBobj, private domaine: any) {

    }

    get agent () {
        return this.db_obj.agent;
    }

    get jeton () {
        return this.db_obj.jeton;
    }

    get creation () {
        return this.db_obj.creation;
    }

    get peremption () {
        return this.db_obj.peremption;
    }

    /**
     * Vérifie si ce jeton est toujours valide.
     * @param jeton jeton du Header Authorization (jwt)
     * @returns booléen
     */
    est_valide (jeton?: string): boolean {
        return (!jeton || jeton == this.db_obj.jeton) && this.db_obj.peremption.getTime() > Date.now();
    }

    /**
     * Va révoquer le jeton - soit le supprimer de la base de données.
     */
    revoque (): void {

    }

}