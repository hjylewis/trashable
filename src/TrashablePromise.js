class TrashablePromise extends Promise {
  constructor(executor) {
    super(executor);
  }
}

module.exports = TrashablePromise;
