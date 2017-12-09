// import store from 'redux/store';
// import { updatePlayerList } from 'redux/modules/newSession';

export default class PlayerList {
  constructor(schema, promoted) {
    this.schema = schema;
    this.promoted = promoted || {};
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
    let promoted = [];
    let promotedGroup;
    let currentGroup = this.schema.length - 1;
    let currentPosition = this.schema[currentGroup] - 1;
    while (currentGroup >= 0 && currentPosition >= 0 && heap.heap.length > 0) {
      const min = heap.removeMin();
      if (promoted.length > 0 && promotedGroup > currentGroup) {
        promoted = promoted.sort((a, b) => a.rating - b.rating);
        while (promoted.length > 0) {
          const cur = promoted.pop();
          this.playerList[currentGroup][currentPosition--] = cur;
          if (currentPosition === 0) {
            currentPosition = this.schema[--currentGroup] - 1;
          }
        }
        promotedGroup = null;
      }

      if (this.promoted[min.id] && currentGroup > 0 && currentPosition <= 2) {
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
