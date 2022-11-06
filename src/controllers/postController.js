const {Post, Comment, User} = require("../models")
const {AsyncErrorHandler} = require("../middlewares")
const {ErrorHandler, Check, time} = require("../utils");
const { postValidation } = require("../validations");
const { default: mongoose } = require("mongoose");
const {config, messages, postConfig, notificationConfig} = require("../config")

exports.createPost = AsyncErrorHandler(async (req, res, next) => {
  const { error } = postValidation.createPost(req);
  if (error) return next(new ErrorHandler(error.details, 409));

  const isExist = await Check.isExist(Post, { title: req.body.title });
  if (isExist) return next(new ErrorHandler(messages.post.titleExist, 409));

  const newPost = new Post({
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    categoryId: req.body.categoryId,
    createdBy: req.user._id,
    tagId: req.body.tagId,
    readTime: time.getReadTime(req.body.content),
  });

  const post = await newPost.save()
  res.status(200).json({
    success: true,
    message: messages.post.create,
    item: post,
  });
});

exports.updatePost = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id
  if(!id) return next(new ErrorHandler(messages.post.idNotProvided, 404))

  const isExist = await Check.isExist(Post, id)
  if(!isExist) return next(new ErrorHandler(messages.post.notExist, 404))

  //self or admin can update the post
  if (isExist.createdBy.toString() !== req.user._id.toString() || !req.user?.isAdmin) 
    return next(new ErrorHandler(messages.post.notAuthorized, 401));

  const updatePostFields = {
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    categoryId: req.body.categoryId,
    tagId: req.body.tagId,
    updatedBy: req.user._id,
    //readTime: time.getReadTime(req.body.content),
  };
  
  if (req.body.content) {
    updatePostFields["readTime"] = time.getReadTime(req.body.content)
  }

  const updatedPost = await Post.findByIdAndUpdate(
    id,
    {
      $set: updatePostFields,
    },
    { new: true }
  )
    .populate("createdBy")
    .populate("updatedBy")
    .populate("categoryId")

  res.status(200).json({
    success: true,
    message: messages.post.update,
    item: updatedPost,
  });
});

exports.deletePost = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler(messages.post.idNotProvided, 404));

  const isExist = await Check.isExist(Post, id);
  if (!isExist) return next(new ErrorHandler(messages.post.notExist, 404));

  //self or admin can update the post
  if (isExist.createdBy.toString() !== req.user._id.toString() || !req.user?.isAdmin)
    return next(new ErrorHandler(messages.post.notAuthorized, 401));

  const post = await Post.findByIdAndDelete(id);

  //delete comments as well
  await Comment.deleteMany({ postId: id });

  res.status(200).json({
    success: true,
    message: messages.post.delete,
  });
});

exports.getAllPosts = AsyncErrorHandler(async (req, res, next) => {
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

  //lookup for tags
  query.push({
    $lookup: {
      from: "tags",
      localField: "tagId",
      foreignField: "_id",
      as: "tags",
    },
  });

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
        userId: mongoose.Types.ObjectId(userId),
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

  //  query.push({
  //    $addFields: {
  //      liked: { $eq: ["likes", mongoose.Types.ObjectId(req.user._id)] },
  //      //bookmarked: { $sum: "$quiz" }
  //    },
  //  });

  //  query.push({
  //    $addFields: {
  //      liked: {
  //        $cond: {
  //          if: {
  //            $eq: ["$likes", mongoose.Types.ObjectId(req.user._id)],
  //          },
  //          then: 1,
  //          else: 0,
  //        },
  //      },
  //    },
  //  });

  // query.push({
  //   $addFields: {
  //     liked: {
  //       $cond: [
  //         { $in: [mongoose.Types.ObjectId(req.user._id), "$likes"] },
  //         true,
  //         false,
  //       ],
  //     },
  //   },
  // });

  let liked, bookmarked
  if (req?.user?._id) {
    liked = {
        $cond: [
          { $in: [mongoose.Types.ObjectId(req.user._id), "$likes"] },
          true,
          false,
        ],
      }
    bookmarked = {
        $cond: [
          { $in: [mongoose.Types.ObjectId(req.user._id), "$bookmarks"] },
          true,
          false,
        ],
      }
    }

  //project
  query.push({
    $project: {
      _id: 1,
      slug: 1,
      type: 1,
      title: 1,
      content: 1,
      description: 1,
      status: 1,
      featuredImage: 1,
      createdAt: 1,
      readTime: 1,
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
      liked,
      bookmarked
      // liked: 1
      
      //liked: 1
      /*liked: {
        $filter: {
          input: "$likes",
          as: "youLiked",
          $cond: {
            $eq: ["$youLiked", mongoose.Types.ObjectId(req.user_id)],
          },
        },
      },*/
      // liked: { $in: mongoose.Types.ObjectId(req.user_id) },
    },
  });

  const posts = await Post.aggregate(query);

  res.status(200).json({
    success: true,
    data: posts,
    meta: {
      pagination: {
        total: total,
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      }
    },
  });
});

exports.getSinglePost = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler(messages.post.idNotProvided, 404));

  const isId = mongoose.Types.ObjectId.isValid(id);
  const post_ID_Slug = isId ? id : { slug: id };

  const isPostExist = await Check.isExist(Post, post_ID_Slug);
  if (!isPostExist) return next(new ErrorHandler(messages.post.notExist, 404));

  const query = [];
  //find by id/slug
  const slug_or_id = {}
  if (isId) {
    slug_or_id._id = mongoose.Types.ObjectId(id);
  }else{
    slug_or_id.slug = id
  }

  query.push({
    $match: slug_or_id,
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

  //preserveNullAndEmptyArrays -> if field is empty or notExist it handle
  query.push(
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "_id",
        as: "updatedBy",
      },
    },
    {
      $unwind: {
        path: "$updatedBy",
        preserveNullAndEmptyArrays: true,
      },
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

  /**
   * localField: "comments.createdBy",
      foreignField: "_id",
      as: "comm",
   * */
  // query.push({
  //   $lookup: {
  //     from: "users",
  //     let: { createdBy : {$toString: "$_id"}},
  //     pipeline: [
  //       {
  //         $match: {$expr: {$eq: ["$createdBy", "$$createdBy"]}}
  //       }
  //     ],
  //     as: "data"
  //   },
  // });

  //lookup for comments
  query.push({
    $lookup: {
      from: "tags",
      localField: "tagId",
      foreignField: "_id",
      as: "tags",
    },
  });

  // query.push({
  //   $lookup: {
  //     from: "users",
  //     localField: "comments.createdBy",
  //     foreignField: "_id",
  //     as: "userr",
  //   },
  // });

  // query.push({
  //   $lookup: {
  //     from: "users",
  //     as: "comm",
  //     let: { user_id: "$commentId" },
  //     pipeline: [
  //       {
  //         $match: {
  //           $expr: { $eq: ["$_id", "$$user_id"] },
  //         },
  //       },
  //     ],
  //   },
  // });

  // query.push(
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "comments.userId",
  //       foreignField: "_id",
  //       as: "comments.user",
  //     },
  //   },
  //   //{ $unwind: "$comments.user" }
  // );

  // query.push({
  //   $lookup: {
  //     from: "users",
  //     localField: "comments.userId",
  //     foreignField: "_id",
  //     as: "userrr",
  //   },
  // });

  //project
  // query.push({
  //   $project: {
  //     _id: 1,
  //     type: 1,
  //     title: 1,
  //     content: 1,
  //     status: 1,
  //     featuredImage: 1,
  //     createdAt: 1,
  //     updatedAt: 1,
  //     "createdBy._id": 1,
  //     "createdBy.role": 1,
  //     "createdBy.name": 1,
  //     "createdBy.email": 1,
  //     "createdBy.avatar": 1,
  //     "creaupdatedBytedBy._id": 1,
  //     "updatedBy.role": 1,
  //     "updatedBy.name": 1,
  //     "updatedBy.email": 1,
  //     "updatedBy.avatar": 1,
  //     category: 1,
  //     comments: 1,
  //   },
  // });

  const post = await Post.aggregate(query);

  res.status(200).json({
    success: true,
    data: post[0],
  });
});

exports.likePost = AsyncErrorHandler(async (req, res, next) => {
  const { error } = postValidation.likePost(req);
  if (error) return next(new ErrorHandler(error.details, 409));

  const id = req.params.id;
  if (!id) return next(new ErrorHandler(messages.post.idNotProvided, 404));

  const post = await Check.isExist(Post, id);
  if (!post) return next(new ErrorHandler(messages.post.notExist, 404));

  const { like } = req.body
  const likeUnlike = (like === true)
      ? { $addToSet: { likes: req.user._id } }
      : { $pull: { likes: req.user._id } };

  const updatedPost = await Post.findByIdAndUpdate(id, likeUnlike, { new: true });

  //notification to post user/author
  const notifyUser = await User.updateOne(
    { _id: post.createdBy },
    {
      $push: {
        notifications: {
          type: notificationConfig.reactions[0], //like
          message: `${req.user.name} ${like ? "liked" : "unliked"} your post.`,
          user: {
            name: req.user.name,
            slug: req.user.slug,
            avatar: req.user.avatar,
          },
          createdAt: new Date().getTime(),
        },
      },
    }
  );

  res.status(200).json({
    success: true,
    message: like ? messages.post.liked : messages.post.unliked,
  });
});

exports.bookmarkPost = AsyncErrorHandler(async (req, res, next) => {
  const { error } = postValidation.bookmarkPost(req);
  if (error) return next(new ErrorHandler(error.details, 409));

  const id = req.params.id;
  if (!id) return next(new ErrorHandler(messages.post.idNotProvided, 404));

  const post = await Check.isExist(Post, id);
  if (!post) return next(new ErrorHandler(messages.post.notExist, 404));

  const { bookmark } = req.body;
  const addRemoveBookmark =
    bookmark === true
      ? { $addToSet: { bookmarks: req.user._id } }
      : { $pull: { bookmarks: req.user._id } };

  const updatedPost = await Post.findByIdAndUpdate(id, addRemoveBookmark, {
    new: true,
  });

  //notification to post user/author
  const notifyUser = await User.updateOne(
    { _id: post.createdBy },
    {
      $push: {
        notifications: {
          type: notificationConfig.reactions[1], //bookmark
          message: `${req.user.name} ${
            bookmark ? "bookmarked" : "unbookmark"
          } your post.`,
          user: {
            name: req.user.name,
            slug: req.user.slug,
            avatar: req.user.avatar,
          },
          createdAt: new Date().getTime(),
        },
      },
    }
  );

  res.status(200).json({
    success: true,
    message: bookmark
      ? messages.post.bookmarked
      : messages.post.bookmarkRemoved,
  });
});
