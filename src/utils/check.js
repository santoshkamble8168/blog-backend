const mongoose = require("mongoose");

exports.isExist = async (model, query) => {
  const isId = mongoose.Types.ObjectId.isValid(query)
  if (typeof query === "string" && !isId) throw new Error("Please provide a valid id") 
  if (isId) return await model.findById(query);
  return await model.findOne(query)
};
