import { Asset, SourceInheritor } from "../index.js";
import type { AssetTypeName } from "../../json_out/assets/AssetTypeName.js";
import type { AssetTypeId, IAssetType, IDisplay, ISource, ParagraphsString } from "../../json_out/index.js";
import type { RequireKey } from "../../utils/types/RequireKey.js";
export declare class AssetType extends SourceInheritor implements IAssetType {
    $id: AssetTypeId;
    Name: AssetTypeName;
    Aliases?: string[] | undefined;
    Description: ParagraphsString;
    Assets: Asset[];
    Display: RequireKey<IDisplay, "Color">;
    constructor(json: IAssetType, rootSource: ISource);
}
//# sourceMappingURL=AssetType.d.ts.map