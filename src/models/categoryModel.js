const mongoose = require("mongoose")
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const categorySchema = new mongoose.Schema(
  {
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
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const categoryModal = mongoose.model("Category", categorySchema);
module.exports = categoryModal;

//Uncategorized - default cagtegory
categoryModal.findOne({ name: "Uncategorized" }, function (err, user) {
  if (!user) {
    var category = new categoryModal({
      name: "Uncategorized"
    });
    category.save((cat) => {
      console.log("Uncategorized categoty CREATED--------------------");
    });
  }
});