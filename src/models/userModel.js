const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs")
const { userCofig } = require("../config");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      default: userCofig.roles[0],
      enum: userCofig.roles,
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
    password: {
      type: String,
      required: [true, "Please provide Password"],
      minLength: [8, "Password should have more than 8 characters"],
    },
    avatar: {
      type: String,
      default: "",
    },
    intro: {
        type: String,
    },
    lastLogin: {
        type: Date
    },
    resetPassword: {
        token: {
            type: String
        },
        tokenExpire:{
            type: Date
        }
    }
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

module.exports = mongoose.model("User", userSchema)