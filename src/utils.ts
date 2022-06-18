export function merge_arrays<T> (a: T[], b: T[]): T[] {
    return [
        ...a,
        ...b.filter(e => a.indexOf(e) < 0)
    ];
}