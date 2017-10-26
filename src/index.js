// @flow

type TrashablePromise = Promise<*> & { trash: () => void };

const makeTrashable = (promise: Promise<*>): TrashablePromise => {
  let trash = () => {};

  const wrappedPromise: any = new Promise((resolve, reject) => {
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
  return (wrappedPromise: TrashablePromise);
};

module.exports = makeTrashable;
