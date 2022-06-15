import { v4, validate, version } from "uuid";
import { AxUsrDB } from "./db";
import ms from "ms";
import CryptoJS, { SHA256 } from "crypto-js";

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
    nom: string;
    prenom: string;
    pseudo: string;
    //privé
    mdp_hash: string;
    roles: string[]
};

export class Utilisateur {
    
    readonly _ax_type = "Utilisateur";

    constructor (private db_obj: usr_DBobj, private db: AxUsrDB, private host: string) {
        
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

    get roles () {
        return [...this.db_obj.roles];
    }

    get nom () {
        return this.db_obj.nom;
    }

    get prenom () {
        return this.db_obj.prenom;
    }

    get patronyme () {
        return this.db_obj.nom ? [this.db_obj.nom || undefined, this.db_obj.prenom].join(" ") : this.prenom;
    }

    get pseudo () {
        return this.db_obj.pseudo;
    }


    /**
     * Donne les informations brutes de l'utilisateur
     */
    get brut () {
        return {
            uid: this.uid,
            id: this.id,
            email: this.email,
            naissance: this.naissance,
            photo: this.photo,
            roles: this.roles,
            nom: this.nom,
            prenom: this.prenom,
            patronyme: this.patronyme,
            pseudo: this.pseudo
        }
    }
    /**
     * Si le mot de passe concorde, crée un jeton (jwt) pour l'utilisateur 
     * @param mdp: mot de passe
     * @returns Jeton de connextion (ou undefined)
     */
    async connecte (mdp: string, agent: string): Promise<usr_Jeton | undefined> {
        if (!this.pass(mdp)) return undefined;

        let c = new Date()
        let p = new Date(c.getTime() + ms("1w")) // Pourra être un paramètre Domaine dans le futur
        let jeton = await this.db.add_jeton(agent, c, p);

        return jeton;
    }

    /**
     * 
     * @param jeton (JWT)
     * @returns Le jeton est valide et appartient à l'utilisateur
     */
    async verifie (jeton: string): Promise<boolean> {
        let J = await this.db.jeton(jeton);
        if (J) return J.est_valide();
        return false;
    }

    pass (mdp: string) {
        return this.db_obj.mdp_hash == SHA256(mdp).toString(CryptoJS.enc.Hex);
    }

    set_email (email: string) { return this.db.set_email(email) }
    set_naissance (date: Date) { return this.db.set_naissance(date) }
    set_photo (photo: string) { return this.db.set_photo(photo) }

    set_mdp (clair: string) {
        let hash = SHA256(clair).toString(CryptoJS.enc.Hex);
        return this.db.set_mdp(hash);
    }
    
    ajoute_role (role: string) {
        if (this.roles.indexOf(role) != -1) {
            this.db_obj.roles.push(role);
        }
        return this.db.set_roles(this.roles);
    }
    suppr_role (role: string) {
        this.db_obj.roles = this.db_obj.roles.filter(e => e != role);
        return this.db.set_roles(this.db_obj.roles);
    }

    supprime () { // A faire - Supprime l'utilisateur de la base de données

    }

    async connexions () {
        return (await this.db.jetons()).map(j => j.brut);
    }

    //Statique
    static gen_uid (): string {
        return "u:" + v4();
    }
    static est_uid (str: string): boolean {
        let s = str.split(':');
        return s[0] === "u" && validate(s[1]) && version(s[1]) == 4;
    }
}


export type usr_Jeton_DBobj = {
    jti: string;
    jeton: string;
    agent: string;
    creation: Date;
    peremption: Date;
}

export class usr_Jeton {

    constructor (private db_obj: usr_Jeton_DBobj, private db: AxUsrDB) {

    }

    get jti () {
        return this.db_obj.jti
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

    get brut () {
        return {
            jti: this.jti,
            agent: this.agent,
            jeton: this.jeton,
            creation: this.creation,
            peremption: this.peremption
        }
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
        this.db.rm_jeton(this.jeton);
    }

}