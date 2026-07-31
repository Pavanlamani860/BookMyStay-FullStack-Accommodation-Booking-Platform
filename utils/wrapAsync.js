//common wrapAsync function for handling the backend errors for every routes written in app.js
//it automatically calls express error handler if any error happens in async/await functions.

module.exports = function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};
