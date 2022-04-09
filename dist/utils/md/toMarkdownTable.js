import { renderOracleCategory } from "./renderOracleCategory.js";
import _ from "lodash-es";
import fs from "fs";
function toMdMultiTableData(rollColumnData, rollColumnLabels, resultColumnData, resultColumnLabels) {
    if (rollColumnLabels.length !== rollColumnData.length) {
        throw new Error("rollColumnLabels.length !== rollColumns.length");
    }
    if (resultColumnLabels.length !== resultColumnData.length) {
        throw new Error("resultColumnLabels.length !== resultColumns.length");
    }
    const minimumRows = [...rollColumnData, ...resultColumnData].map(col => col.length).reduce((colA, colB) => colA > colB ? colA : colB);
    const rollColumns = rollColumnData.map((col, index) => toRollColumnArray(rollColumnLabels[index], col, minimumRows));
    const resultColumns = resultColumnData.map((col, index) => toResultColumnArray(resultColumnLabels[index], col, minimumRows));
    return [...rollColumns, ...resultColumns];
}
export function toSummaryColumnArray(label, rows, minimumRows) {
    const rowContent = rows.map(row => row.Summary || "");
    return toColumnArray(label, rowContent, minimumRows);
}
export function toResultColumnArray(label, rows, minimumRows) {
    const rowContent = rows.map(row => row.Result);
    return toColumnArray(label, rowContent, minimumRows);
}
export function toRollColumnArray(label, rows, minimumRows) {
    const rowContent = rows.map(row => {
        if (row.Ceiling === row.Floor) {
            if (row.Ceiling === null) {
                return "--";
            }
            else {
                return row.Ceiling.toString();
            }
        }
        else {
            if (row.Ceiling === null || row.Floor === null) {
                throw new Error();
            }
            return `${row.Floor}-${row.Ceiling}`;
        }
    });
    return toColumnArray(label, rowContent, minimumRows);
}
function toColumnArray(label, rowContent, minimumRows) {
    while (rowContent.length < minimumRows) {
        rowContent.concat("");
    }
    rowContent.unshift(label);
    return rowContent;
}
export function toMdTable(...columnArrays) {
    const transposed = transpose2dArray(columnArrays);
    return mdTableFrom2dArray(transposed);
}
function mdTableFrom2dArray(array2d) {
    const columnMax = array2d.map(column => column.map(row => row.length).reduce((rowA, rowB) => rowA > rowB ? rowA : rowB));
    const md2dArray = array2d.map(row => {
        row = row.map((column, index) => column.padEnd(columnMax[index]));
        return row;
    });
    const headerBorder = columnMax.map(columnWidth => _.repeat("-", columnWidth));
    md2dArray.splice(1, 0, headerBorder);
    let mdRowStrings = md2dArray.map((row) => row.map((col, i) => col.padEnd(columnMax[i])).join(" | "));
    mdRowStrings = mdRowStrings.map(row => row.trim());
    const tableString = mdRowStrings.join("\n");
    return tableString;
}
function transpose2dArray(array2d) {
    return array2d[0].map((_, colIndex) => array2d.map(row => row[colIndex]));
}
function buildMdOracles(headerText = "Ironsworn Oracles", ...oracleData) {
    const header = "# " + headerText;
    const oracleMarkdown = oracleData.map(oracleCat => renderOracleCategory(oracleCat), 2);
    return header + "\n\n" + oracleMarkdown.join("\n\n") + "\n";
}
const files = fs.readdirSync("./").filter(dir => dir.match(/^ironsworn_oracles/))
    .map(file => "./" + file);
const text = buildMdOracles(...files);
fs.writeFileSync("./oracles.md", text);
//# sourceMappingURL=toMarkdownTable.js.map