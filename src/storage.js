const uuidKey = "onde-bleue-app:user-uuid";
const idKey = "onde-bleue-app:user-identifier";
const tokenKey = "onde-bleue-app:user-token";

// Singleton class, will keep info saved in localStorage and maintain a cache in memory
export default class Storage {

  static instance;

  constructor() {
    if (Storage.instance) {
      return Storage.instance;
    }
    Storage.instance = this;

    this.identifierData = undefined;
    this.tokenData = undefined;
    this.idData = undefined;
  }

  get identifier() {
    if (this.identifierData) {
      return this.identifierData;
    }
    const value = localStorage.getItem(idKey);
    this.identifierData = value;
    return value;
  }

  get token() {
    if (this.tokenData) {
      return this.tokenData;
    }
    const value = localStorage.getItem(tokenKey);
    this.tokenData = value;
    return value;
  }

  get id() {
    if (this.idData) {
      return this.idData;
    }
    const value = localStorage.getItem(uuidKey);
    this.idData = value;
    return value;
  }

  storeUser(user) {
    this.identifierData = user.identifier;
    this.tokenData = user.token;
    this.idData = user._id;
    localStorage.setItem(uuidKey, user._id);
    localStorage.setItem(idKey, user.identifier);
    localStorage.setItem(tokenKey, user.token);
  }

  isAuthenticated() {
    return !!this.id && !!this.identifier && !!this.token;
  }

  disconnect() {
    localStorage.removeItem(uuidKey);
    localStorage.removeItem(idKey);
    localStorage.removeItem(tokenKey);
    this.identifierData = undefined;
    this.tokenData = undefined;
    this.idData = undefined;
  }
}
