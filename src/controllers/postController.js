const {Post} = require("../models")

exports.createPost = async(req,res) => {
    try {
        const post = await Post.create(req.body);
        res.status(200).json({
          success: true,
          item: post,
        });
    } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
    }
}