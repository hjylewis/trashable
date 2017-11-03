/* eslint-disable no-console */
var weak = require('weak');

// Solution provide in https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
const makeCancelable = promise => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => (hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)),
      error => (hasCanceled_ ? reject({ isCanceled: true }) : reject(error))
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};

// Class that should be able to be garbaged collected when promise is trashed.
class Foo {
  constructor(promise) {
    promise
      .then(() => {
        console.log('I am holding onto this reference...', this);
      })
      .catch(error => {
        if (error.isCanceled) return;
        console.log('I am holding onto this reference...', this);
      });
  }
}

var promise = new Promise(resolve => {
  // Holds onto reference of resolve callback
  setTimeout(resolve, 1000);
});

var cancelableButNotTrashed = makeCancelable(promise);

// Object we want garbaged collected
var foo = new Foo(cancelableButNotTrashed.promise);

// Cancel/trash promise before resolves
cancelableButNotTrashed.cancel();

// Dereference
cancelableButNotTrashed = null;
promise = null;

// Track foo
var ref = weak(foo, function() {
  console.log('foo was garbaged collected');
});

// Dereference foo
foo = null;

console.log('Before garbage collection', ref);
global.gc();
console.log('After garbage collection', ref);
