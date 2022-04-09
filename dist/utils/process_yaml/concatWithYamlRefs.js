import { REFS_PATH } from "../../constants/index.js";
import { loadYamlRefs } from "./loadYamlRefs.js";
import { loadYamlTemplates } from "./loadYamlTemplates.js";
import yaml from "js-yaml";
import fs from "fs";
export function concatWithYamlRefs(referencePath = REFS_PATH, ...filePaths) {
    const refFiles = fs.readdirSync(REFS_PATH);
    const refString = loadYamlRefs(referencePath);
    const templateString = loadYamlTemplates(referencePath.toString() + "/templates/");
    const fileStrings = filePaths.map(path => fs.readFileSync(path, { encoding: "utf-8" }));
    const dataStrings = [refString, templateString, ...fileStrings];
    const dataObject = yaml.load(dataStrings.join("\n\n"));
    return dataObject;
}
//# sourceMappingURL=concatWithYamlRefs.js.map