const { Tag, Post } = require("../models");
const { AsyncErrorHandler } = require("../middlewares");
const { tagValidation } = require("../validations");
const { Check, ErrorHandler } = require("../utils");
const { messages, config } = require("../config");

exports.createTag = AsyncErrorHandler(async(req, res, next) => {
    const {error} = tagValidation.createTag(req)
    if (error) return next(new ErrorHandler(error.details, 409));

    const isExist = await Check.isExist(Tag, { tag: req.body.tag });
    if (isExist) return next(new ErrorHandler(messages.tag.alreadyExist, 409));

    const tag = await Tag.create({tag: req.body.tag});
    res.status(200).json({
      success: true,
      message: messages.tag.create,
      item: tag,
    });
})

exports.deleteTag = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler(messages.tag.idNotProvided, 404));

  const isExist = await Check.isExist(Tag, id);
  if (!isExist) return next(new ErrorHandler(messages.tag.notExist, 404));

  //only admin can delete the tags
  if (!req.user?.isAdmin)
    return next(new ErrorHandler(messages.tag.notAuthorized, 401));

  const tag = await Tag.findByIdAndDelete(id);

  //delete tags from post as well
  await Post.updateMany({ tagId: id }, { $pull: { tagId: id } });

  res.status(200).json({
    success: true,
    message: messages.tag.delete,
  });
});

exports.getAllTags = AsyncErrorHandler(async (req, res, next) => {
  const { search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

  let query = [];

  if (search && search !== "") {
    query.push({
      $match: {
        $or: [
          { tag: { $regex: search, $options: "i" } },
        ],
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
  const total = await Tag.countDocuments(query);
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit
    ? parseInt(req.query.limit)
    : parseInt(config.pageLimit);
  const skip = (page - 1) * limit;

//   query.push({
//     $skip: skip,
//   });

//   query.push({
//     $limit: limit,
//   });

//   query.push({
//     $facet: {
//       metadata: [
//         { $count: "total" },
//         { $addFields: { page: page } },
//       ],
//       data: [{ $skip: skip }, { $limit: limit }], // add projection here wish you re-shape the docs
//     },
//   });

  //project
  query.push({
    $project: {
      _id: 1,
      slug: 1,
      tag: 1,
      image: 1,
    },
  });

  const tags = await Tag.aggregate(query);

  res.status(200).json({
    success: true,
    item: {
      tags,
      meta: {
        total: total,
        currentPage: page,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

