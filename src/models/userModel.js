const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs")
const { userConfig, notificationConfig } = require("../config");
const crypto = require("crypto")
const {tokens} = require("../utils")
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);
const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: userConfig.roles[0],
      enum: userConfig.roles,
    },
    userName: {
      type: String,
      required: [true, "Please provide a user name"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Please provide Name"],
    },
    slug: {
      type: String,
      require: true,
      unique: true,
      slug: "userName",
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
    social: [
      {
        media: { type: String },
        url: { type: String },
        handle: { type: String },
      },
    ],
    notifications: [
      {
        type: {
          type: String,
          enum: notificationConfig.reactions,
        },
        message: {
          type: String,
        },
        createdAt: {
          type: Date,
        },
        read: {
          type: Boolean,
          default: false,
        },
        user: {
          name: String,
          slug: String,
          avatar: String,
        },
      },
    ],
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

const UserModel = mongoose.model("User", userSchema);

UserModel.findOne({ role: "admin" }, function (err, found) {
  if (!found) {
    const user = new UserModel({
      name: "Admin",
      email: "admin@admin.com",
      password: "password",
      status: "active",
      role: "admin"
    });
    user.save((rs) => {
      console.log("ADMIN CREATED--------------------");
    });
  }
});

module.exports = UserModel