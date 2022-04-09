import type { RequireKey } from "./RequireKey.js";
declare type PartialExcept<T, K extends keyof T> = RequireKey<{
    [P in keyof T]?: T[P];
}, K>;
export { PartialExcept };
//# sourceMappingURL=PartialExcept.d.ts.map