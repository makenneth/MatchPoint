import RotatingArray from 'utils/RotatingArray';
import Schedules from './schedules';

class Schedule {
  constructor() {
    this.schedules = Schedules;
  }

  findSchedule(people) {
    if (this.schedules[+people]) {
      return this.schedules[+people];
    }

    const ra = new RotatingArray(people);
    const sched = ra.getAllRounds();
    this.schedules[String(people)] = sched;

    return this.schedules[String(people)];
  }
}

export default new Schedule();
