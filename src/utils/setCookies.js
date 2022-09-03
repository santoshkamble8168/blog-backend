const {generateJwtToken} = require("./tokens")
const {config} = require("../config")
module.exports = async (user, res, statusCode, message) => {
  const token = await generateJwtToken(user);

  //set cookies
  const options = {
    expires: new Date(
      Date.now() + config.cookieExpire * 1000 * 60 * 60 * 24 //1day
    ),
    httpOnly: true,
  };

  const { verifyEmail, password, resetPassword, ...userDetails} = user._doc;
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message: message,
    item: userDetails,
  });
};
