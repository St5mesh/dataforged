import type { ChallengeRank, EncounterId, EncounterNature, EncounterTags, ParagraphsString } from "../../json_out/index.js";
import type { IEncounterYaml } from "../index.js";
export interface IEncounterVariantYaml extends Partial<IEncounterYaml> {
    $id?: EncounterId;
    Name: string;
    Rank: ChallengeRank;
    Description: ParagraphsString;
    Nature?: EncounterNature | undefined;
    Tags?: EncounterTags[] | undefined;
}
//# sourceMappingURL=IEncounterVariantYaml.d.ts.map