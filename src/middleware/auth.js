import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  // Get token from the Authorization header
  const authHeader = req.header('Authorization');

  // Check if the header exists and is in the correct format ('Bearer <token>')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Extract the token from the 'Bearer <token>' string
    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user payload to the request object
    req.user = decoded.user;
    next();
  } catch (err) {
    // This will catch invalid or expired tokens
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export { protect };
