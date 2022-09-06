const {Comment, Post} = require("../models");
const { ErrorHandler, Check } = require("../utils");
const { commentValidation } = require("../validations");
const { AsyncErrorHandler } = require("../middlewares");
const { config, messages } = require("../config");

exports.createComment = AsyncErrorHandler(async (req, res, next) => {
    const { comment, postId } = req.body;
    const { error } = commentValidation.createComment(req);
    if (error) return next(new ErrorHandler(error.details, 409));

    const isPostExist = await Check.isExist(Post, postId)
    if(!isPostExist) return next(new ErrorHandler(messages.post.notExist, 404))

    const newCommnet = new Comment({
      comment: comment,
      postId: postId,
      createdBy: req.user._id,
    });

    const createComment = await newCommnet.save()

    //update post comments
    await Post.updateOne(
      { _id: postId },
      {
        $push: { commentId: createComment._id },
      }
    );

    res.status(200).json({
      success: true,
      messages: messages.comment.create,
      item: createComment,
    });
})

exports.updateComment = AsyncErrorHandler(async (req, res, next) => {
  const postId = req.params.postId;
  if (!postId) return next(new ErrorHandler(messages.post.idNotProvided, 404));

  const isExist = await Check.isExist(Post, postId);
  if (!isExist) return next(new ErrorHandler(messages.post.notExist, 404));

  const id = req.body.id;
  if (!id) return next(new ErrorHandler(messages.comment.idNotProvided, 404));

  const isCommentExist = await Check.isExist(Comment, id);
  if (!isCommentExist) return next(new ErrorHandler(messages.comment.notExist, 404));

  //self or admin can update the comment
  if (
    isCommentExist.createdBy.toString() !== req.user._id.toString() ||
    !req.user?.isAdmin
  )
    return next(new ErrorHandler(messages.comment.notAuthorized, 401));

  const updateComment = await Comment.findByIdAndUpdate(
    id,
    {
      $set: { comment: req.body.comment },
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    messages: messages.comment.update,
    item: updateComment,
  });
})

exports.deleteComment = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler(messages.comment.idNotProvided, 404));

  const comment = await Check.isExist(Comment, id);
  if (!comment) return next(new ErrorHandler(messages.comment.notExist, 404));

  //self or admin can delete the comment
  if (comment.createdBy.toString() !== req.user._id.toString() || !req.user?.isAdmin)
    return next(new ErrorHandler(messages.comment.notAuthorized, 401));

  const commentDelete = await Comment.findByIdAndDelete(id);

  //delete comment from post 
    await Post.updateOne(
        {_id: comment.postId},
        {
            $pull: {commentId: comment._id}
        }
    )

  res.status(200).json({
    success: true,
    message: messages.comment.delete,
  });
});

exports.getAllComments = AsyncErrorHandler(async (req, res) => {
    const {
      search,
      userId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

  const postId = req.params.postId;
  if (!postId) return next(new ErrorHandler(messages.post.idNotProvided, 404));

  const query = []
  //lookup for users
  query.push(
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    }
  );


  if (search && search !== "") {
    query.push({
      $match: {
        $or: [
          { comment: { $regex: search, $options: "i" } }
        ],
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
  const total = await Comment.countDocuments(query);
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
      comment: 1,
      createdAt: 1,
      postId: 1,
      "user._id": 1,
      "user._role": 1,
      "user.name": 1,
      "user.email": 1,
      "user.avatar": 1,
    },
  });
  
  const comments = await Comment.aggregate(query);

  res.status(200).json({
    success: true,
    item: {
      item: comments,
      meta: {
        total: total,
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
})