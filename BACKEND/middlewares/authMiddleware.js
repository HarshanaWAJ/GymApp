const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'No token, access denied' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Assuming your token payload is { userId: '...' }
    req.user = { _id: decoded.userId }; // <-- set user as an object with _id

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
