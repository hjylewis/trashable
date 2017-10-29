# Trashable :put_litter_in_its_place:
[![npm](https://img.shields.io/npm/v/trashable.svg?style=flat-square)](https://www.npmjs.com/package/trashable)
[![NPM file size](http://img.badgesize.io/https://npmcdn.com/trashable/lib/index.js?style=flat-square)](https://www.npmjs.com/package/trashable)
[![David](https://david-dm.org/hjylewis/trashable.svg?style=flat-square)](https://www.npmjs.com/package/trashable)
[![CircleCI](https://img.shields.io/circleci/project/github/hjylewis/trashable.svg?style=flat-square)](https://circleci.com/gh/hjylewis/trashable)
[![npm](https://img.shields.io/npm/l/trashable.svg?style=flat-square)](https://github.com/hjylewis/trashable/blob/master/LICENSE)


A wrapper to make promises cancellable and garbage collectable. See how this relates to React [below](#react) and use [trashable-react](https://github.com/hjylewis/trashable-react) to make your React components garbage collectable.

## Installation

```
npm install --save trashable
```

## How to use

```
import makeTrashable from 'trashable';

let promise = new Promise((resolve) => {
    setTimeout(resolve, 10000);
});

let trashablePromise = makeTrashable(promise);
trashablePromise.then(() => {
    console.log('10 seconds have passed');
});

trashablePromise.trash();
```

## Why you should cancel promises
> You wanted a banana but what you got was a gorilla holding the banana and the entire jungle.
>
>  — Joe Armstrong

The handlers you pass to promises often reference other objects. These objects can be quick large. This means if the promise is still in flight (not resolved or rejected), these large objects cannot be safely garbage collected even when the promise result has been forgotten and been ignored. That is why canceling promises so that the objects their handlers reference can be freed is so important.

### React

In particular, this issue has reared it's head in React with the use of `isMount()` method (now depreciated). [This article](https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html) gives a good explanation for why using `isMount()` should be avoided. Simply put, prevents a garbage collector from getting rid of potentially large React Elements.

It recommends to clean up any callbacks in `componentWillUnmount` so that they won't call `setState()` after the element has been unmounted and thus continue to reference the Element.

Unfortunately, this is not that easy if promises are used and the solution it provides in that article actually doesn't solve the garbage collection problem. The cancel method does nothing to deference the handlers and the Element will not be garbage collected (see more in the [PROOF](PROOF.md)).

Use [trashable-react](https://github.com/hjylewis/trashable-react) to make your React components garbage collectable.

## Why is this any different than other Cancelable Promise libraries

Unlike other cancelable promise libraries, Trashable actually deferences the promise handlers so that objects that were referenced can be garbaged collected appropriately, freeing up memory.

## Gotchas

You need to make your promises trashable **before** you add your `then` and `catch` handlers. Otherwise, you will not get the garbage collection benefits.

```
// Do this
const trashablePromise = makeTrashable(promise);
trashablePromise.then(() => {});

// NOT this
const handledPromise = promise.then(() => {});
makeTrashable(handledPromise);
```

## Inspiration
* @istarkov's [solution](https://github.com/facebook/react/issues/5465#issuecomment-157888325)
* @benmmurphy's [solution](https://github.com/facebook/react/issues/5465#issuecomment-287161992)
