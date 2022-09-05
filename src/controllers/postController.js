const {Post} = require("../models")
const {AsyncErrorHandler} = require("../middlewares")
const {ErrorHandler, Check} = require("../utils");
const { postValidation } = require("../validations");
const { default: mongoose } = require("mongoose");
const {config} = require("../config")

exports.createPost = AsyncErrorHandler(async (req, res, next) => {
  const { error } = postValidation.createPost(req);
  if (error) return next(new ErrorHandler(error.details, 409));

  const isExist = await Check.isExist(Post, { title: req.body.title });
  if (isExist) return next(new ErrorHandler("Title already exist", 409));
  
  const newPost = new Post({
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    categoryId: req.body.categoryId,
    userId: req.user._id
  });

  const post = await newPost.save()
  res.status(200).json({
    success: true,
    item: post,
  });
});

exports.updatePost = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id
  if(!id) return next(new ErrorHandler("Please provide post id", 404))

  const isExist = await Check.isExist(Post, id)
  if(!isExist) return next(new ErrorHandler("Post not found", 404))

  const updatePostFields = {
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    categoryId: req.body.categoryId,
    userId: req.user._id,
  }

  const updatedPost = await Post.updateOne(
    id,
    {
      $set: updatePostFields
    },
    {new: true}
  );

  res.status(200).json({
    success: true,
    message: "Post updated",
    item: updatedPost,
  });
});

exports.deletePost = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("Please provide post id", 404));

  const post = await Post.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Post deleted successfully!",
  });
});

exports.getAllPosts = AsyncErrorHandler(async (req, res) => {
  const {
    search,
    status,
    category,
    userId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  let query = [];

  //lookup for users
  query.push(
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    }
  );

  //lookup for category
  query.push(
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    }
  );

  if (search && search !== "") {
    query.push({
      $match: {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  if (status) {
    query.push({
      $match: {
        status: status,
      },
    });
  }

  //category slug
  if (category) {
    query.push({
      $match: {
        "category.slug": category,
      },
    });
  }

  if (userId) {
    query.push({
      $match: {
        "userId": mongoose.Types.ObjectId(userId),
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

  //pagination
  const total = await Post.countDocuments(query);
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
      categoryId: 0,
      userId: 0,
      "user.password": 0,
      "user.isDeleted": 0,
      "user.resetPassword": 0,
      "user.verifyEmail": 0,
    },
  });
  const posts = await Post.aggregate(query);

  res.status(200).json({
    success: true,
    item: {
      posts,
      meta: {
        total: total,
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

exports.getSinglePost = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("Post Id not provided", 404));
  
  const isId = mongoose.Types.ObjectId.isValid(id)
  const query = isId ? id : {slug: id}

  const post = await Check.isExist(Post, query);
  if (!post) return next(new ErrorHandler("Post not found", 404));

  res.status(200).json({
    success: true,
    item: post,
  });
});