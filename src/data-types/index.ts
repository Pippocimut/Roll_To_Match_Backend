export * from "./temp";
export * from "./games";
export * from "./schedule"

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;