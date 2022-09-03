const crypto = require("crypto")
const JWT = require("jsonwebtoken")
const {config} = require("../config")

exports.generateJwtToken = async (user) => {
    return await JWT.sign(
      {
        email: user.email,
        _id: user._id,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    );
};

exports.decodeJwtToken = (token) => {
    return JWT.verify(token, config.jwtSecret);
};

exports.generateCryptoToken = () => {
  return crypto.randomBytes(32).toString("hex");
}
