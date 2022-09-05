const { Category } = require("../models");
const { AsyncErrorHandler } = require("../middlewares");
const { categoryValidation } = require("../validations");
const { ErrorHandler, Check } = require("../utils");
const { messages, config } = require("../config");

exports.createCategory = AsyncErrorHandler(async (req, res, next) => {
  const { name } = req.body;
  const { error } = categoryValidation.createCategory(req);
  if (error) return next(new ErrorHandler(error.details, 409));

  const isExist = await Check.isExist(Category, { name: name });
  if (isExist)
    return next(new ErrorHandler(messages.category.alredyExist, 409));

  const category = await Category.create({ name });
  res.status(200).json({
    success: true,
    item: category,
  });
});

exports.updateCategory = AsyncErrorHandler(async (req, res, next) => {
  const { name } = req.body;
  const id = req.params.id;
  if (!id) return next(new ErrorHandler(messages.category.idNotProvided, 404));

  const category = Check.isExist(Category, id);
  if (!category) return next(new ErrorHandler(messages.category.notExist, 404));

  const updateCategory = await Category.findOneAndUpdate(
    id,
    {
      $set: { name },
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    messages: messages.category.update,
    item: updateCategory,
  });
});

exports.deleteCategory = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler(messages.category.idNotProvided, 404));

  const category = await Category.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: messages.category.delete,
  });
});

exports.getAllCategory = AsyncErrorHandler(async (req, res, next) => {
  const { search, sortBy = "name", sortOrder = "asc" } = req.query;
  let query = [];

  if (search && search !== "") {
    query.push({
      $match: {
        $or: [{ name: { $regex: search, $options: "i" } }],
      },
    });
  }

  if (sortBy && sortOrder) {
    let sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    query.push({
      $sort: sort,
    });
  }

  const total = await Category.countDocuments(query);
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit
    ? parseInt(req.query.limit)
    : parseInt(config.pageLimit);
  const skip = (page - 1) * limit;

  query.push({
    $skip: skip,
  });

  query.push({
    $limit: limit,
  });

  //project
  query.push({
    $project: {
      _id: 1,
      name: 1,
      createdAt: 1,
    },
  });
  const categories = await Category.aggregate(query);

  res.status(200).json({
    success: true,
    item: {
      categories,
      meta: {
        total: total,
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

exports.getSingleCategory = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler(messages.category.idNotProvided, 404));

  const category = await Check.isExist(Category, id);
  if (!category) return next(new ErrorHandler(messages.category.notExist, 404));

  res.status(200).json({
    success: true,
    item: category,
  });
});
