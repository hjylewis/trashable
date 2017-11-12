// @flow

export type TrashablePromise<T> = Promise<T> & { trash: () => void };

function makeTrashable<T>(promise: Promise<T>): TrashablePromise<T> {
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
  return (wrappedPromise: TrashablePromise<T>);
}

module.exports = makeTrashable;
