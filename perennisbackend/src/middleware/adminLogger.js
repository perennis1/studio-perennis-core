// perennisbackend/src/middleware/adminLogger.js
// perennisbackend/src/middleware/adminLogger.js

function adminLogger(action) {
  return function (req, _res, next) {
    try {
      const userId = req.user?.id ?? "unknown";

      console.log(
        `[ADMIN] ${new Date().toISOString()} user=${userId} action=${action} method=${req.method} path=${req.originalUrl}`
      );

      next();
    } catch (err) {
      next(err);
    }
  };
}

export default adminLogger;
export { adminLogger };
