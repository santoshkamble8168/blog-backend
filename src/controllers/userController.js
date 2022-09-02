const {User} = require("../models")

exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body)
        res.status(200).json({
          success: true,
          item: user,
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
    }
}