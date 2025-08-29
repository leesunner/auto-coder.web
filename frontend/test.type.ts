type PartialParams<T extends any[]> = { [K in keyof T]: Partial<T[K]> };

type a = PartialParams<[{ a: number }, { c: string }, string]>;
const b: a = [{}, {}, "a"];
