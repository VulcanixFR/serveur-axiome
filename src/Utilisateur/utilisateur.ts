type usr_AUTH_UID = [ string, string, string ]; // [ uid, jeton, hote ]

type usr_BDobj = {
    //public
    uid: string;
    id: string;
    email: string;
    naissance: Date;
    photo: string;
    //privé
    mdp_hash: string;
    jetons: string[];
};

class Utilisateur {

    constructor (private db_obj: usr_BDobj) {
        
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
     * Si le mot de passe concorde, crée un jeton jwt pour l'utilisateur 
     * @param mdp: mot de passe
     * @returns Jeton de connextion (ou undefined)
     */
    connecte (mdp: string): any | undefined {

        return undefined;
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