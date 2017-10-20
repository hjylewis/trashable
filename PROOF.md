# Garbage Collection proof

## Other Solutions

So say you have a class that handles a promise on construction:

```
class Foo {
    constructor(promise) {
        promise.then(() => {
            console.log("I am holding onto this reference...", this);
        }).catch(() => {
            if (error.isCanceled) return;
            console.log("I am holding onto this reference...", this);
        });
    }
}
```

And a promise you want to pass to is:
```
var promise = new Promise((resolve, reject) => {
    // Holds onto reference of resolve callback
    setTimeout(resolve, 1000);
});
```

If we abandon the foo object, we want to be able to cancel the promise and so that the object can be garbage collected. So, we use the solution found in the [React article](https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html) and pass it to the `Foo` class:
```
const makeCancelable = (promise) => {
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

var cancelableButNotTrashed = makeCancelable(promise);

// Object we want garbaged collected
var foo = new Foo(cancelableButNotTrashed.promise);
```

Now let's abandon the object and cancel the promise:

```
// Cancel/trash promise before resolves
cancelableButNotTrashed.cancel();

// Deference
cancelableButNotTrashed = null;
promise = null;

// Track foo
var ref = weak(foo, function () {
  console.log("foo was garbaged collected");
});

// Deference foo
foo = null;

console.log("Before garbage collection", ref);
global.gc();
console.log("After garbage collection", ref);
```

Unfortunately, this solutions cancel does nothing to deference the foo object so it cannot be garbage collected.

Run `node --expose-gc examples/disproof.js` to see for yourself.

## This solution

This time, let's instead use `makeTrashable()`;

```
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
  console.log("foo was garbaged collected");
});

// Deference foo
foo = null;

console.log("Before garbage collection", ref);
global.gc();
console.log("After garbage collection", ref);
```

Now, the `trash()` method deferences the foo object which is then able to be garbage collected.

Run `node --expose-gc examples/proof.js` to see for yourself.
