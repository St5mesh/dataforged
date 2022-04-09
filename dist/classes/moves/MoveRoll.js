import { CustomStatOption } from "../index.js";
export class ActionRoll {
    constructor(json, parent) {
        this.Stat = json.Stat;
        this["All of"] = json["All of"];
        this["Best of"] = json["Best of"];
        this["Worst of"] = json["Worst of"];
        if (json["Custom stat"]) {
            this["Custom stat"] = json["Custom stat"] ? new CustomStat(json["Custom stat"], parent.$id + " / Custom stat") : undefined;
        }
    }
}
export class CustomStat {
    constructor(json, id) {
        this.$id = id;
        this.Name = json.Name;
        this.Options = json.Options?.map(option => new CustomStatOption(option, `${id} / ${option.Name}`));
    }
}
//# sourceMappingURL=MoveRoll.js.map