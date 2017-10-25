const makeTrashable = (promise) => {
  let trash = () => {};

  const wrappedPromise = new Promise((resolve, reject) => {
    trash = () => {
      resolve = null;
      reject = null;
    };

    promise.then(
      (val) => {
        if (resolve) resolve(val);
      }, (error) => {
        if (reject) reject(error);
      }
    );
  });

  wrappedPromise.trash = trash;
  return wrappedPromise;
};

module.exports = makeTrashable;
