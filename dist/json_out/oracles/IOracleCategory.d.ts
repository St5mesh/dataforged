import type { IHasName, IOracleBase, OracleCategoryId, OracleCategoryJaggedId, OracleCategoryName } from "../index.js";
export interface IOracleCategory extends IOracleBase, IHasName<OracleCategoryName> {
    $id: OracleCategoryId;
    Category?: OracleCategoryJaggedId | undefined;
    Categories?: IOracleCategory[] | undefined;
    "Sample Names"?: string[] | undefined;
}
//# sourceMappingURL=IOracleCategory.d.ts.map