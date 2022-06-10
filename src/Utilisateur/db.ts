import { usr_DBobj, usr_Jeton } from "./utilisateur";

export interface AxUsrDB {

    init (): Promise<boolean>;

    self (): Promise<usr_DBobj>;
    jetons (): Promise<usr_Jeton[]>;
    jeton (jti: string): Promise<usr_Jeton>;

    //setters
    set_email: (email: string) => Promise<boolean>;
    set_naissance: (naissance: Date) => Promise<boolean>;
    set_photo: (photo: string) => Promise<boolean>;
    set_mdp: (hash: string) => Promise<boolean>;
    set_roles: (roles: string[]) => Promise<boolean>;

    //Ajouts
    add_jeton: (agent: string, creation: Date, peremption: Date, scope?: any) => Promise<usr_Jeton>;
    
    //Enlève
    rm_jeton: (jti: string) => Promise<boolean>;

}

