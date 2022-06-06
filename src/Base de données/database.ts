import { dmn_DBobj, Domaine } from "../Domaine/domaine";

export interface AxDB {

    ok: boolean;
    init(): Promise<boolean>;
    
    domaines (): Promise<dmn_DBobj[]>;
    domaine (host: string): Promise<Domaine>;

}