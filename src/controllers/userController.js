const { User, Post } = require("../models");
const { AsyncErrorHandler } = require("../middlewares");
const { ErrorHandler, Check } = require("../utils");
const { userValidation } = require("../validations");
const { messages, userConfig, config } = require("../config");

exports.createUser = AsyncErrorHandler(async (req, res, next) => {
  const { error } = userValidation.createUser(req);
  if (error) return next(new ErrorHandler(error.details, 409));

  const isExist = await Check.isExist(User, { email: req.body.email });
  if (isExist) return next(new ErrorHandler("Email already registered", 409));

  await User.create(req.body);
  //send email for verifation email address

  res.status(201).json({
    success: true,
    message: messages.user.create,
  });
});

exports.updateUser = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("User Id not provided", 404));

  const user = Check.isExist(User, id);
  if (!user) return next(new ErrorHandler("User not provided", 404));

  //email & password not allowed here to update
  const updateFields = {
    name: req.body.name,
    role: req.body.role,
    avatar: req.body.avatar,
    status: req.body.status,
    social: req.body.social
  };

  const updateUser = await User.findOneAndUpdate(
    id,
    {
      $set: updateFields,
    },
    { new: true }
  )

  res.status(200).json({
    success: true,
    messages: messages.user.update,
    item: updateUser,
  });
});

exports.updateUserPassword = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("User Id not provided", 404));
  
  if(req.body.password !== req.body.confirmPassword) return next(new ErrorHandler("Password not matched", 401))

  const user = await User.findById(id).select("+password")
  if (!user) return next(new ErrorHandler("User not found", 404));

  const isPasswordMatched = await user.verifyPassword(req.body.oldPassword);
  if(!isPasswordMatched) return next(new ErrorHandler("old password is incorrect!", 401))

  user.password = req.body.password

  await user.save()

  res.status(200).json({
    success: true,
    message: messages.user.passwordUpdate,
  });
});

exports.deleteUser = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("User Id not provided", 404));

  const user = await User.findById(id).select("+isDeleted");
  if (!user) return next(new ErrorHandler("user not found", 404));

  //self or admin can delete the post
  if (user._id.toString() !== req.user._id.toString() || !req.user?.isAdmin)
    return next(new ErrorHandler(messages.user.notAuthorized, 401));

  user.isDeleted = true;
  /*here we done soft delete so, 
    if any post releated to this user will still visible,
    but user is no longer able to login*/

  await user.save();

  res.status(200).json({
    success: true,
    message: messages.user.delete,
  });
});

exports.getAllUsers = AsyncErrorHandler(async (req, res) => {
  const { search, status, sortBy = "createdAt", sortOrder = "desc", role = userConfig.roles[0] } = req.query;
  /*
  //searching
  let query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  //filters++
  if (status) {
    query.status = status
  }
  if (role) {
    query.role = role;
  }
  const users = await User.find(query).limit(limit).skip(limit * page)*/

  let query = [];

  //isDeleted remove from query
  query.push({
    $match: {
      isDeleted: false,
    },
  });

  // query.push({
  //   $lookup: {
  //     from: "follows",
  //     localField: "_id",
  //     foreignField: "userId",
  //     as: "following",
  //   },
  // });

  query.push(
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "followable_id",
        as: "followed",
      },
    },
    {
      $unwind: {
        path: "$followed",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  /*query.push({
    $lookup: {
      from: "follows",
      let: {
        user_id: "$_id",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$userId", "$$user_id"] },
                { $eq: ["$type", "user"] },
              ],
            },
          },
        },
      ],
      as: "following",
    },
  });*/


  // query.push({
  //   $lookup: {
  //     from: "follows",
  //     let: { userIds: { $toString: "$_id" } },
  //     pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$userIds"] } } }],
  //     as: "follw",
  //   },
  // });

  /*query.push({
    $lookup: {
      from: "follows",
      let: { planIdInPlan: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$userId", "$$planIdInPlan"],
            },
          },
        },
      ],
      as: "feedback",
    },
  });*/
  
  if (search && search !== "") {
    query.push({
      $match: {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
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

  if (role) {
    query.push({
      $match: {
        role: role,
      },
    });
  }

  if (sortBy && sortOrder) {
    let sort = {}
    sort[sortBy] = (sortOrder === "asc") ? 1 : -1
    query.push({
      $sort: sort
    })
  }


  const total = await User.countDocuments(query);
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
      role: 1,
      name: 1,
      email: 1,
      slug: 1,
      avatar: 1,
      status: 1,
      createdAt: 1,
      //followed: { $size: { $ifNull: ["$following", []] } },
      followed: { $size: { $ifNull: ["$followed.userId", []] } },
    },
  });
  const users = await User.aggregate(query);

  res.status(200).json({
    success: true,
    item: {
      users,
      meta: {
        total: total,
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

exports.getUser = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler(messages.user.idNotProvided, 404));

  const user = await Check.isExist(User, id);
  if (!user) return next(new ErrorHandler(messages.user.notExist, 404));

  res.status(200).json({
    success: true,
    item: user,
  });
});

//get loggedin profile
exports.getProfile = AsyncErrorHandler(async (req, res, next) => {
  console.log("getProfile");
  const user = req.user

  res.status(200).json({
    success: true,
    item: user,
  });
});

exports.getUserLikes = AsyncErrorHandler(async (req, res, next) => {
  const query = [];

  const userId = req.user._id;

  query.push({
    $sort: { createdAt : -1},
  });

  query.push({
    $match: { likes: userId },
  });

  //lookup for users
  query.push(
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$createdBy",
    }
  );

  //lookup for category
  query.push({
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "category",
    },
  });

  //lookup for comments
  query.push({
    $lookup: {
      from: "comments",
      localField: "commentId",
      foreignField: "_id",
      as: "comments",
    },
  });

  //lookup for comments
  query.push({
    $lookup: {
      from: "tags",
      localField: "tagId",
      foreignField: "_id",
      as: "tags",
    },
  });

  //project
  query.push({
    $project: {
      _id: 1,
      slug: 1,
      type: 1,
      title: 1,
      content: 1,
      status: 1,
      featuredImage: 1,
      createdAt: 1,
      "createdBy._id": 1,
      "createdBy.role": 1,
      "createdBy.name": 1,
      "createdBy.email": 1,
      "createdBy.avatar": 1,
      "category._id": 1,
      "category.name": 1,
      "category.createdAt": 1,
      "category.slug": 1,
      "tags._id": 1,
      "tags.tag": 1,
      "tags.slug": 1,
      comments: { $size: { $ifNull: ["$commentId", []] } },
      likes: { $size: { $ifNull: ["$likes", []] } },
      bookmarks: { $size: { $ifNull: ["$bookmarks", []] } },
    },
  });

  const posts = await Post.aggregate(query);

  res.status(200).json({
    success: true,
    item: posts,
  });
});

exports.getUserBookmarks = AsyncErrorHandler(async (req, res, next) => {
  const query = [];

  const userId = req.user._id;

  query.push({
    $sort: { createdAt: -1 },
  });

  query.push({
    $match: { bookmarks: userId },
  });

  //lookup for users
  query.push(
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$createdBy",
    }
  );

  //lookup for category
  query.push({
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "category",
    },
  });

  //lookup for comments
  query.push({
    $lookup: {
      from: "comments",
      localField: "commentId",
      foreignField: "_id",
      as: "comments",
    },
  });

  //lookup for comments
  query.push({
    $lookup: {
      from: "tags",
      localField: "tagId",
      foreignField: "_id",
      as: "tags",
    },
  });

  //project
  query.push({
    $project: {
      _id: 1,
      slug: 1,
      type: 1,
      title: 1,
      content: 1,
      status: 1,
      featuredImage: 1,
      createdAt: 1,
      "createdBy._id": 1,
      "createdBy.role": 1,
      "createdBy.name": 1,
      "createdBy.email": 1,
      "createdBy.avatar": 1,
      "category._id": 1,
      "category.name": 1,
      "category.createdAt": 1,
      "category.slug": 1,
      "tags._id": 1,
      "tags.tag": 1,
      "tags.slug": 1,
      comments: { $size: { $ifNull: ["$commentId", []] } },
      likes: { $size: { $ifNull: ["$likes", []] } },
      bookmarks: { $size: { $ifNull: ["$bookmarks", []] } },
    },
  });

  const posts = await Post.aggregate(query);

  res.status(200).json({
    success: true,
    item: posts,
  });
});

exports.followUser = AsyncErrorHandler(async (req, res, next) => {
  const { error } = userValidation.followUser(req);
  if (error) return next(new ErrorHandler(error.details, 409));

  const id = req.params.id;
  if (!id) return next(new ErrorHandler(messages.user.idNotProvided, 404));

  const isExist = await Check.isExist(User, id);
  if (!isExist) return next(new ErrorHandler(messages.user.notExist, 404));

  if(isExist._id.toString() === req.user._id.toString())
    return next(new ErrorHandler(messages.user.selfFollowError, 409));

  const { following } = req.body;
  const followUnfollow =
    following === true
      ? { $addToSet: { following: req.user._id } }
      : { $pull: { following: req.user._id } };

  const updateduser = await User.findByIdAndUpdate(id, followUnfollow, {
    new: true,
  });

  res.status(200).json({
    success: true,
    message: following ? messages.user.followed : messages.user.unfollowed,
  });
});