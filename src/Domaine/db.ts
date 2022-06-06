import { Utilisateur } from "../Utilisateur/utilisateur";

export interface AxDmnDB {

    ok: boolean;
    init (): Promise<boolean>;

    utilisateurs (): Promise<number>;
    utilisateur (uid: string): Promise<Utilisateur>;
    
}