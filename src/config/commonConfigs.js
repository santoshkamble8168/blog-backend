const dotenv = require("dotenv");
const envExist = dotenv.config();
if (envExist.error) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

//exports all configs
module.exports = {
  nodeENV: process.env.NODE_ENV,
  port: process.env.SERVER_PORT,
  database: {
    url: process.env.MONGODB,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
    },
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE,
  cookieExpire: process.env.COOKIE_EXPIRE,
  resetPasswordURL: process.env.PASSWORD_RESET_URI
};
