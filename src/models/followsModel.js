const { default: mongoose } = require("mongoose");
const {followConfig} = require("../config");

const folowsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: followConfig.followTypes,
    },
    followable_id: {
      type: mongoose.Types.ObjectId,
    },
    userId: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Follows", folowsSchema)