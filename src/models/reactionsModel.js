const { default: mongoose } = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    post_id: {
      type: mongoose.Types.ObjectId,
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
    bokmarks: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
    upvotes: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reactions", reactionSchema);
