const weak = require('weak');
const makeTrashable = require('../src/index');

describe('makeTrashable()', () => {
  test('still resolves promise', () => {
    const value = 'this is a value';
    return expect(makeTrashable(Promise.resolve(value))).resolves.toBe(value);
  });

  test('still rejects promise', () => {
    const error = new Error('this is an error');
    return expect(makeTrashable(Promise.reject(error))).rejects.toBe(error);
  });

  describe('.trash()', () => {
    test('cancels the promise', () => {
      const timeoutPromise = delay => {
        return new Promise(resolve => {
          setTimeout(resolve, delay);
        });
      };

      const handler = jest.fn();
      const trashablePromise = makeTrashable(timeoutPromise(50));
      trashablePromise.then(handler);
      trashablePromise.trash();

      return timeoutPromise(100).then(() => {
        expect(handler).not.toHaveBeenCalled();
      });
    });

    test('makes handler garbage collectable', () => {
      class Foo {
        constructor(promise) {
          this.exists = true;
          promise
            .then(() => {
              // I am holding onto this reference...
              this.resolve = true;
            })
            .catch(() => {
              // I am holding onto this reference...
              this.reject = true;
            });
        }
      }

      var promise = new Promise(resolve => {
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

      const mock = jest.fn();

      // Track foo
      var ref = weak(foo, mock);

      // Deference foo
      foo = null;

      expect(ref.exists).toBeTruthy();
      if (global.gc) {
        global.gc();
        expect(ref.exists).toBeFalsy();
        expect(mock).toHaveBeenCalled();
      }
    });
  });
});
