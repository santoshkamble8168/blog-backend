const { User } = require("../models");
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
    status: req.body.status
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

  user.isDeleted = true

  await user.save()

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
      createdAt: 1
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
  if (!id) return next(new ErrorHandler("User Id not provided", 404));

  const user = await Check.isExist(User, id);
  if (!user) return next(new ErrorHandler("user not found", 404));

  res.status(200).json({
    success: true,
    item: user,
  });
});
