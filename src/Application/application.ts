import { v4, validate, version } from "uuid";

export type app_AUTH_AID = [ string, string ]; // [ aid, jeton ]


export class Application {

    readonly _ax_type = "Application";

    get aid (): string {
        return "a:oui"
    }

    static gen_aid (): string {
        return "a:" + v4();
    }
    static est_aid (str: string): boolean {
        let s = str.split(':');
        return s[0] === "a" && validate(s[1]) && version(s[1]) == 4;
    }

}

export default Application;