// various utilities

// We will wait this value (in ms) before calling some endpoint.
// If any other request of the same type if called meanwhile, the previous is cancelled and the new is called instead.
const CALL_DELAY = 1000;


// =====     stackable api calls     =====
export class Stackable {

  constructor(successCallback, failCallback) {
    this.stack = [];
    this.timeout = null;
    this.successCb = successCallback;
    this.failCb = failCallback;
  }

  add(call) {
    this.stack.push(call);
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => this.run(), CALL_DELAY);
  }

  run() {
    const last = this.stack.length - 1;
    try {
      const result = this.stack[last]();

      this.timeout = null;
      this.stack = [];

      if (typeof this.successCb === 'function') this.successCb(result);
    } catch (e) {
      if (typeof this.failCb === 'function') this.failCb(e);
    }
  }

  set successCallback(cb) {
    this.successCb = cb;
  }

  set failCallback(cb) {
    this.failCb = cb;
  }
}

// =====     cancelable Promise     =====
// credits to https://github.com/facebook/react/issues/5465#issuecomment-157888325
export const makeCancelable = (promise) => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => hasCanceled_ ? reject({isCanceled: true}) : resolve(val),
      error => hasCanceled_ ? reject({isCanceled: true}) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};


// =====     pretty print number     =====
// credits to https://stackoverflow.com/a/2901298/1039377
export function numberFormat(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
