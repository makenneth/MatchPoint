export default class PlayerList {
  constructor(schema, promoted, promotionEnabled) {
    this.schema = schema;
    this.promoted = promoted || {};
    this.promotionEnabled = promotionEnabled;
    this.playerList = schema.map((p) => [...new Array(p)]);
    this.currentGroup = 0;
  }

  append(player) {
    const group = this.playerList[this.currentGroup];
    group.push(player);

    if (group.length >= this.schema[this.currentGroup]) {
      this.currentGroup++;
    }
  }

  getSortedList(heap) {
    const promoted = [];
    let promotedGroup;
    let currentGroup = this.schema.length - 1;
    let currentPosition = this.schema[currentGroup] - 1;
    while (currentGroup >= 0 && currentPosition >= 0 && heap.heap.length > 0) {
      const min = heap.removeMin();
      if (promoted.length > 0 && promotedGroup > currentGroup) {
        while (promoted.length > 0) {
          const cur = promoted.shift();
          this.playerList[currentGroup][currentPosition--] = cur;
          if (currentPosition === -1) {
            currentPosition = this.schema[--currentGroup] - 1;
          }
        }
        promotedGroup = null;
      }

      if (this.promotionEnabled && this.promoted[min.id] &&
        currentGroup > 0 && currentPosition <= 2) {
        promoted.push(min);
        promotedGroup = currentGroup;
      } else {
        this.playerList[currentGroup][currentPosition--] = min;
        if (currentPosition === -1) {
          currentPosition = this.schema[--currentGroup] - 1;
        }
      }
    }
  }

  flatten() {
    const list = [];
    this.playerList.forEach(group => list.push(...group));
    return list;
  }

  toArray() {
    return this.playerList;
  }

  swap(group1, idx1, swapeeId) {
    let group2;
    let idx2;
    this.playerList.forEach((group, i) => {
      group.forEach((p, j) => {
        if (p.id === swapeeId) {
          group2 = i;
          idx2 = j;
        }
      });
    });

    const groupOne = [
      this.playerList[group2][idx2],
      ...this.playerList[group1].slice(0, idx1),
      ...this.playerList[group1].slice(idx1 + 1),
    ].sort((a, b) => b.rating - a.rating);

    const groupTwo = [
      this.playerList[group1][idx1],
      ...this.playerList[group2].slice(0, idx2),
      ...this.playerList[group2].slice(idx2 + 1),
    ].sort((a, b) => b.rating - a.rating);

    this.playerList = this.playerList.map((g, i) => {
      if (i === group1) {
        return groupOne;
      }
      if (i === group2) {
        return groupTwo;
      }

      return g;
    });
  }

  promote(group, idx) {
    if (group < 1 || idx < 0 || idx >= this.schema[group]) {
      return false;
    }
    const promoteTarget = this.playerList[group][idx];
    // swap with last member of the higher group
    const swapTargetGroup = this.playerList[group - 1];
    const swapTarget = swapTargetGroup[swapTargetGroup.length - 1];

    const targetGroupList = [
      swapTarget,
      ...this.playerList[group].slice(0, idx),
      ...this.playerList[group].slice(idx + 1),
    ];

    const swapGroupList = [
      ...swapTargetGroup.slice(0, -1),
      promoteTarget,
    ];
    this.playerList = [
      ...this.playerList.slice(0, group - 1),
      swapGroupList,
      targetGroupList,
      ...this.playerList.slice(group + 1),
    ];

    return true;
  }

  demote(group, idx) {
    if (group < 0 || group >= this.playerList.length ||
      idx < 0 || idx >= this.schema[group]) {
      return false;
    }
    const demoteTarget = this.playerList[group][idx];

    // swap with the first memebr of the lower group
    const swapTarget = this.playerList[group + 1][0];
    const targetGroupList = [
      ...this.playerList[group].slice(0, idx),
      ...this.playerList[group].slice(idx + 1),
      swapTarget,
    ];

    const swapGroupList = [
      demoteTarget,
      ...this.playerList[group + 1].slice(1),
    ];

    this.playerList = [
      ...this.playerList.slice(0, group),
      targetGroupList,
      swapGroupList,
      ...this.playerList.slice(group + 2),
    ];

    return true;
  }
}
