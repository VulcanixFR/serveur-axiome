import { dmn_DBobj, Domaine } from "../Domaine/domaine";

export interface AxDB {

    init(): Promise<boolean>;
    
    domaines (): Promise<dmn_DBobj[]>;
    domaine (host: string): Promise<Domaine>;

    nouv_domaine(host: string): Promise<{err:string} | {err: undefined, domaine: Domaine}>;

}