import { Utilisateur } from "../Utilisateur/utilisateur";

export interface AxDmnDB {

    init (): Promise<boolean>;

    utilisateurs (): Promise<number>;
    utilisateur (uid: string): Promise<Utilisateur|undefined>;
    
}