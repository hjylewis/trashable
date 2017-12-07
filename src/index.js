function makeTrashable(promise) {
  promise = Promise.resolve(promise);

  let trashed = false;
  let thenHandler;
  let catchHandler;
  let resolve;

  promise.then(
    val => {
      if (thenHandler && resolve) {
        resolve(makeTrashable(thenHandler(val)));
      }
    },
    error => {
      if (catchHandler && resolve) {
        resolve(makeTrashable(catchHandler(error)));
      }
    }
  );

  const wrappedPromise = {
    then(handler) {
      if (trashed) return new Promise(() => {});
      thenHandler = handler;
      return new Promise(_resolve => {
        resolve = _resolve;
      });
    },
    catch(handler) {
      if (trashed) return new Promise(() => {});
      catchHandler = handler;
      return new Promise(_resolve => {
        resolve = _resolve;
      });
    },
    trash() {
      trashed = true;
      thenHandler = null;
      catchHandler = null;
      resolve = null;
    },
  };

  return wrappedPromise;
}

module.exports = makeTrashable;
