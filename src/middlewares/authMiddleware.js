const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const message = require("../../config/message.json");
dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res
        .status(401)
        .json({ status: false, message: message.MIDDLEWARE.ACCESS_DENIDED });
    }
    const verified = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = verified;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({
        status: false,
        message: message.MIDDLEWARE.INVALID_EXPIRE_TOKEN,
      });
  }
};

module.exports = authMiddleware;
