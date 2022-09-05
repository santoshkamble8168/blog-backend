module.exports = {
  user: {
    create: `Account created successfully!
    We have sent an email with a confirmation link to your email address.`,
    update: "User updated successfully!",
    delete: "User deleted successfully!",
    passwordUpdate: "Password updated successfully!",
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
  },
};