module.exports = {
  user: {
    create: `Account created successfully!
    We have sent an email with a confirmation link to your email address.`,
    update: "User updated successfully!",
    delete: "User deleted successfully!",
    passwordUpdate: "Password updated successfully!",
    notAuthorized: "Not authorized to perform this action",
    followed: "The user has been followed",
    unfollowed: "The user has been unfollowed",
    idNotProvided: "user Id not provided",
    notExist: "user not exist",
    selfFollowError: "you can't follow yourself",
  },
  auth: {
    forgotPassword: "Your password reset token is",
    resetPasswordErr: "Toekn is invalid or expired",
    passwordNotMatched: "password not matched",
    passwordUpdated: "Password updated successfully!",
    logout: "You are successfully logged out",
    provideValidEmail: "Please provide valid email",
    emailPasswordIncorrect: "Email or possword is incorrect!",
  },
  category: {
    idNotProvided: "category Id not provided",
    alredyExist: "Category already exist",
    notExist: "Category not exist",
    update: "category updated successfully!",
    delete: "category deleted successfully!",
    followed: "The category has been followed",
    unfollowed: "The category has been unfollowed",
  },
  post: {
    titleExist: "Title already exist",
    idNotProvided: "post Id not provided",
    alredyExist: "post already exist",
    notExist: "post not exist",
    create: "post created successfully!",
    update: "post updated successfully!",
    delete: "post deleted successfully!",
    notAuthorized: "Not authorized to update this post",
    liked: "The post has been liked",
    unliked: "The post has been unliked",
    bookmarked: "The post has been bookmarked",
    bookmarkRemoved: "post  bookmark removed",
  },
  comment: {
    idNotProvided: "comment Id not provided",
    notExist: "comment not exist",
    create: "comment created successfully!",
    update: "comment updated successfully!",
    delete: "comment deleted successfully!",
    notAuthorized: "Not authorized to update this comment",
  },
  tag: {
    alreadyExist: "tag already exist",
    idNotProvided: "tag Id not provided",
    notExist: "tag not exist",
    create: "tag created successfully!",
    update: "tag updated successfully!",
    delete: "tag deleted successfully!",
    notAuthorized: "Not authorized to update this tag",
    followed: "The tag has been followed",
    unfollowed: "The tag has been unfollowed",
  },
};