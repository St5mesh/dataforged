import jsonpath from "jsonpath";
export function getTableByOracleId(oracleData, id) {
    if (!Array.isArray(oracleData) && oracleData.$id === id) {
        const data = oracleData;
        if (data.Table) {
            return data.Table;
        }
    }
    ;
    const table = jsonpath.value(oracleData, `$..[?(@.$id=='${id}')].Table`);
    return table;
}
//# sourceMappingURL=getTableByOracleId.js.map