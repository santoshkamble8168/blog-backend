const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs")
const { userConfig } = require("../config");
const crypto = require("crypto")
const {tokens} = require("../utils")

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: userConfig.roles[0],
      enum: userConfig.roles,
    },
    name: {
      type: String,
      required: [true, "Please provide Name"],
    },
    email: {
      type: String,
      required: [true, "Please provide Email"],
      unique: true,
    },
    verifyEmail: {
      select: false,
      token: {
        type: String,
      },
      expire: {
        type: Date,
      },
    },
    password: {
      type: String,
      required: [true, "Please provide Password"],
      minLength: [8, "Password should have more than 8 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    intro: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
    status: {
      type: String,
      default: userConfig.status[0],
      enum: userConfig.status,
    },
    resetPassword: {
      token: {
        type: String,
      },
      tokenExpire: {
        type: Date,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

//hashed password
userSchema.pre("save", async function(next){
    if (!this.isModified("password")) 
        next()
    
    this.password = await bcrypt.hash(this.password, 10)
})

//verify password
userSchema.methods.verifyPassword = async function(inputPassword){
    return await bcrypt.compare(inputPassword, this.password)
}

//handle soft delete
userSchema.pre("find", function(){
    this.where({ isDeleted: false});
})
userSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

//email verification token
userSchema.pre("save", async function(next){
    if (!this.isModified("verifyEmail")) next();
    
    const verifyEmail = {
      token: tokens.generateCryptoToken(),
      expire: new Date(Date.now() + 1000 * 60 * 60 * 24), //1day
    };

    this.verifyEmail = verifyEmail;
})

module.exports = mongoose.model("User", userSchema)