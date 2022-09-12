const { default: mongoose } = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Please provide blog id"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user id"],
    },
    reply: []
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);