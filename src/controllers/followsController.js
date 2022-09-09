const { default: mongoose } = require("mongoose");
const { Follows } = require("../models");
const { AsyncErrorHandler } = require("../middlewares");
const { ErrorHandler, Check } = require("../utils");
const { postValidation } = require("../validations");
const { config, messages } = require("../config");

exports.registerFollowUnfollow = AsyncErrorHandler(async (req, res, next) => {
  const follow = await Check.isExist(Follows, {
    followable_id: req.body.followable_id,
    type: req.body.type,
  });
  
  let message = `The ${req.body.type} has been`
  if (follow) {
    const isExist = await Check.isExist(Follows, {
        followable_id: req.body.followable_id,
        type: req.body.type,
        userId: req.user._id,
    });

    const followUnfollow = isExist
      ? { $pull: { userId: req.user._id } }
      : { $addToSet: { userId: req.user._id } };

    const updateFollow = await Follows.findByIdAndUpdate(
      follow._id,
      followUnfollow,
      {
        new: true,
      }
    );
    message = isExist ? `${message} unfollowed` : `${message} followed`;
  } else {
    newFollow = new Follows({
      type: req.body.type,
      followable_id: req.body.followable_id,
      userId: [req.user._id],
    });
    const follows = await newFollow.save();
    message = message + " followed (new)"
  }

  res.status(200).json({
    success: true,
    message: message,
  });
});

exports.getFollowMeta = AsyncErrorHandler(async (req, res, next) => {
    const id = req.params.id;
    if (!id) return next(new ErrorHandler("followable_id not provided", 404));

    const isExist = await Check.isExist(Follows, { followable_id : id});
    if (!isExist) return next(new ErrorHandler("followable_id not found", 404));

    const query = []
    

    query.push({
      $match: {
        followable_id: mongoose.Types.ObjectId(id)
      },
    });

    query.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "users"
      },
    });

    query.push({
      $project: {
        _id: 1,
        type: 1,
        followed: { $size: { $ifNull: ["$users", []] } },
        "users._id": 1,
        "users.name": 1,
        "users.email": 1,
        "users.avatar": 1,
        "users.slug": 1,
      },
    });

    const follow = await Follows.aggregate(query)

    res.status(200).json({
      success: true,
      item: follow,
    });
})
