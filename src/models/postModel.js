const { default: mongoose } = require("mongoose");
const slug = require("mongoose-slug-updater")
const {postConfig} = require("../config")

mongoose.plugin(slug)
const postSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      default: postConfig.postTypes[0],
      enum: postConfig.postTypes,
    },
    slug: {
      type: String,
      require: true,
      unique: true,
      slug: "title",
    },
    title: {
      type: String,
      required: [true, "Please provide title"],
    },
    description: {
      type: String,
    },
    content: {
      type: String,
      required: [true, "Please provide the content"],
    },
    status: {
      type: String,
      default: postConfig.status[0],
      enum: postConfig.status,
    },
    featuredImage: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    categoryId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    commentId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    tagId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tags",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema)