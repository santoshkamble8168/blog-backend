const { default: mongoose } = require("mongoose");
const slug = require("mongoose-slug-updater")

mongoose.plugin(slug)
const tagsSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    require: true,
    unique: true,
    slug: "tag",
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Tags", tagsSchema)