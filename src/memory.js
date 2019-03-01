// Singleton class, will keep provided data in memory
export default class Memory {

  static instance;

  constructor() {
    if (Memory.instance) {
      return Memory.instance;
    }
    Memory.instance = this;

    this.data = {};
  }

  set(id, value) {
    this.data[id] = value;
  }

  get(id) {
    return this.data[id];
  }

  remove(id) {
    delete this.data[id];
  }
}
