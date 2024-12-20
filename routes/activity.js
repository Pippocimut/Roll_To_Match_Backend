const express = require('express');
const router = express.Router();
const { body } = require('express-validator')

const Post = require('../models/Post');
const ActivityController = require('../controllers/ActivityController');
const postLiveCheck = require('../middlewares/postLiveCheckMiddleware').postLiveCheck;

const postBody = [
    body('message').isLength({ min: 10 }).optional()
];

//Common checks for all routes
router.use("/:postId", async (req, res, next) => {
    const post = await Post.findById(req.params.postId);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    next();
});

router.use("/:postId", postLiveCheck);

//Routes
router.post("/:postId/comment", postBody, ActivityController.createComment);
router.delete("/:postId/comment/:id", ActivityController.deleteComment);
router.patch("/:postId/comment/:id", postBody, ActivityController.updateComment);

router.post("/:postId/like", ActivityController.createLike);
router.delete("/:postId/like", ActivityController.deleteLike);

router.post("/:postId/dislike", ActivityController.createDislike);
router.delete("/:postId/dislike", ActivityController.deleteDislike);

module.exports = router;