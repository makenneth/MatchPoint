export default class PlayerList {
  constructor(schema) {
    this.schema = schema;
    this.playerList = schema.map(() => []);
    this.currentGroup = 0;
  }

  append(player) {
    const group = this.playerList[this.currentGroup];
    group.push(player);

    if (group.length >= this.schema[this.currentGroup]) {
      this.currentGroup++;
    }
  }

  toArray() {
    return this.playerList;
  }

  promote(group, idx) {
    if (group < 1 || idx < 0 || idx >= this.schema[group]) {
      return;
    }
    const target = this.playerList[group][idx];
    const swapIdx = this.schema[group - 1] - 1;
    this.playerList[group][idx] = this.playerList[group - 1][swapIdx];
    this.playerList[group - 1][swapIdx] = target;
  }

  demote(group, idx) {
    if (group < 0 || group >= this.playerList.length ||
      idx < 0 || idx >= this.schema[group]) {
      return;
    }
    const target = this.playerList[group][idx];
    const swapIdx = this.schema[group + 1] - 1;
    this.playerList[group][idx] = this.playerList[group + 1][swapIdx];
    this.playerList[group + 1][swapIdx] = target;
  }
}
