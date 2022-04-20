import type { AttributeKey } from "../../json_out/index.js";
import type { AttributeHash } from "../../utils/types/AttributeHash.js";
export interface IRequirementsYaml<K extends AttributeKey = AttributeKey> {
    Attributes: AttributeHash<K>;
}
//# sourceMappingURL=IRequirementsYaml.d.ts.map