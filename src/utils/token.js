const jwt = require("jsonwebtoken");

exports.generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
};

exports.generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "7d" });
};

exports.verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
