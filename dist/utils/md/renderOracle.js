import { buildLog } from "../logging/buildLog.js";
import { extractColumnData } from "./extractColumnData.js";
import { renderTable } from "./renderTable.js";
import _ from "lodash-es";
export function renderOracle(oracle, headerLevel = 3) {
    if (oracle.Display["Column of"]) {
        return "";
    }
    buildLog(renderOracle, `Generating markdown for ${oracle.Display.Title}...`);
    const header = _.repeat("#", headerLevel) + " " + (oracle.Display.Title);
    const items = [header];
    if (oracle.Description) {
        items.push(oracle.Description);
    }
    const tableData = extractColumnData(oracle);
    const table = renderTable(tableData);
    items.push(table);
    return items.join("\n\n");
}
//# sourceMappingURL=renderOracle.js.map