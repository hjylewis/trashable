/* eslint-disable no-console */
const weak = require('weak');
const makeTrashable = require('../src/index');

// Class that should be able to be garbaged collected when promise is trashed.
class Foo {
  constructor(promise) {
    promise.then(() => {
      console.log('I am holding onto this reference...', this);
    }).catch(() => {
      console.log('I am holding onto this reference...', this);
    });
  }
}

var promise = new Promise((resolve) => {
  // Holds onto reference of resolve callback
  setTimeout(resolve, 1000);
});

var trashablePromise = makeTrashable(promise);

// Object we want garbaged collected
var foo = new Foo(trashablePromise);

// Cancel/trash promise before resolves
trashablePromise.trash();

// Deference
trashablePromise = null;
promise = null;

// Track foo
var ref = weak(foo, function () {
  console.log('foo was garbaged collected');
});

// Deference foo
foo = null;

console.log('Before garbage collection', ref);
global.gc();
console.log('After garbage collection', ref);
