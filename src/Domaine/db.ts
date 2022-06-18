import { Utilisateur } from "../Utilisateur/utilisateur";

export type dmn_props = 'alias' | 'defaut' | 'admin' | 'inscription' |
                        'lieux' | 'liste_noire' | 'accentuation' | 'image' |
                        'titre' | 'apropos' | 'rootfs';
export type dmn_inscr_mode = 'ouvert' | 'code' | 'manuel';

export interface AxDmnDB {

    init (): Promise<boolean>;

    //Renvoie le nombre d'utilisateurs
    utilisateurs (): Promise<number>;
    //Cherche un utilisateur par son uid
    utilisateur (uid: string): Promise<Utilisateur|undefined>;
    //Cherche un utilisateur par son id
    utilisateur (id: string): Promise<Utilisateur|undefined>;

    set_prop (prop: 'alias', value: string[]): Promise<boolean>;
    set_prop (prop: 'defaut', value: boolean): Promise<boolean>;
    set_prop (prop: 'admin', value: string): Promise<boolean>;
    set_prop (prop: 'inscription', value: dmn_inscr_mode): Promise<boolean>;
    set_prop (prop: 'lieux', value: string[]): Promise<boolean>;
    set_prop (prop: 'liste_noire', value: boolean): Promise<boolean>;
    set_prop (prop: 'accentuation', value: string): Promise<boolean>;
    set_prop (prop: 'image', value: string): Promise<boolean>;
    set_prop (prop: 'titre', value: string): Promise<boolean>;
    set_prop (prop: 'apropos', value: string): Promise<boolean>;
    set_prop (prop: 'rootfs', value: string): Promise<boolean>;
    set_prop (prop: dmn_props, value: string | number | string[] | boolean): Promise<boolean>;

    //Supprime le domaine
    supprime (): Promise<boolean>; 
    
}