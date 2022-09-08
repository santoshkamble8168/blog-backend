const { default: mongoose } = require("mongoose");
const { Follows } = require("../models");
const { AsyncErrorHandler } = require("../middlewares");
const { ErrorHandler, Check } = require("../utils");
const { postValidation } = require("../validations");
const { config, messages } = require("../config");

exports.registerFollow = AsyncErrorHandler(async (req, res, next) => {
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
