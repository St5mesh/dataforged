import { Source } from "./index.js";
import type { IHasSource, ISource } from "../../json_out/meta/index.js";
export declare abstract class SourceInheritor implements IHasSource {
    Source: Source;
    constructor(json: Partial<ISource>, ...sourceAncestors: ISource[]);
}
//# sourceMappingURL=SourceInheritor.d.ts.map