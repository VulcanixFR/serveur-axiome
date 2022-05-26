import express from "express";

type transaction<T> = {
    "@axiome": {
        version: string; //TMP
        domaine: string;
        de: usr_AUTH_UID | app_AUTH_AID;
        pour: usr_AUTH_UID | app_AUTH_AID;
        cree: Date;
    },
    valeur: T
} | {
    "@axiome": {
        version: string; 
        domaine: string;
        anonyme: true; 
    },
    valeur: T
};

export default function Transaction<T> (valeur: T, domaine: string, version: string, de: usr_AUTH_UID | app_AUTH_AID | undefined, pour?: usr_AUTH_UID | app_AUTH_AID): transaction<T> {
    if (de === undefined) {
        return {
            "@axiome": {
                anonyme: true, cree: new Date(), version, domaine
            },
            valeur
        }
    }
    return {
        "@axiome": {
            domaine, cree: new Date(), version, de, pour: (pour || de)
        },
        valeur
    }
}