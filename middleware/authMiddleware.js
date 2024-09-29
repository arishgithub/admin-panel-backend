import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer ')) {
    try {
      token = token.split(' ')[1];  // Remove "Bearer" and extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify token
      req.admin = decoded;  // Attach decoded token data (admin id) to request object
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
};

export default protect;
