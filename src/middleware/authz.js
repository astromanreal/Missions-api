import ErrorResponse from '../utils/errorResponse.js';

/**
 * @desc Middleware to authorize user roles.
 * @param {...string} roles - The roles that are authorized to access the route.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
