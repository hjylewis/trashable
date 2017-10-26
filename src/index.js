// @flow

type TrashablePromise = Promise<*> & { trash?: () => void };

const makeTrashable = (promise: Promise<*>) => {
  let trash = () => {};

  const wrappedPromise: TrashablePromise = new Promise((resolve, reject) => {
    trash = () => {
      resolve = null;
      reject = null;
    };

    promise.then(
      val => {
        if (resolve) resolve(val);
      },
      error => {
        if (reject) reject(error);
      }
    );
  });

  wrappedPromise.trash = trash;
  return wrappedPromise;
};

module.exports = makeTrashable;
