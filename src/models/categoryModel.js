const mongoose = require("mongoose")
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Category name is required"],
  },
  slug: {
    type: String,
    require: true,
    unique: true,
    slug: "name",
  },
  description: {
    type: String,
  },
}, {
    timestamps: true
});

module.exports = mongoose.model("Category", categorySchema)