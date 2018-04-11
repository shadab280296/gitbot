const _this = {
  async: function async(makeGenerator) {
    return function () {
      const generator = makeGenerator.apply(this, arguments); // eslint-disable-line
      function handle(result) {
        if (result.done) return Promise.resolve(result.value);
        return Promise.resolve(result.value).then(
          res => handle(generator.next(res)),
          err => handle(generator.throw(err))
        );
      }
      try {
        return handle(generator.next());
      } catch (ex) {
        return Promise.reject(ex);
      }
    };
  },
  hasAttribute(attributes, attr) {
    return (attributes & attr) === attr; // eslint-disable-line
  },
};

module.exports = _this;
