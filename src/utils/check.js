const mongoose = require("mongoose");
exports.isExist = async (model, query) => {
  var isId = mongoose.Types.ObjectId.isValid(query)
  if (isId) return await model.findById(query)
  return await model.findOne(query)
};
