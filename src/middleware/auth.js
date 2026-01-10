import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Import the User model
import ErrorResponse from '../utils/errorResponse.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to the request
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
        return next(new ErrorResponse('No user found with this id', 404));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

export { protect };
