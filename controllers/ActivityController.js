const ActivityService = require('../services/ActivityService');

exports.createLike = async (req, res) => {
    const result = await ActivityService.isThisMyPost(req.params.postId, req.user.id)

    if (result) {
        return res.status(400).json({ error: 'You cannot like your own post' });
    }

    const giveLikeResult = await ActivityService.giveLike(req.params.postId, req.user.id);
    const removeDislikeResult = await ActivityService.removeDislike(req.params.postId, req.user.id);

    return res.json({ message: "Like added" });
};

exports.deleteLike = async (req, res) => {
    const result = await ActivityService.isThisMyPost(req.params.postId, req.user.id)
    if (result) {
        return res.status(400).json({ error: 'You cannot remove like from your own post' });
    }

    const removeLikeResult = await ActivityService.removeLike(req.params.postId, req.user.id);

    return res.json({ message: "Like removed" });
}

exports.createDislike = async (req, res) => {
    const result = await ActivityService.isThisMyPost(req.params.postId, req.user.id)
    if (result) {
        return res.status(400).json({ error: 'You cannot dislike your own post' });
    }

    const giveDislikeResult = await ActivityService.giveDislike(req.params.postId, req.user.id);
    const removeLikeResult = await ActivityService.removeLike(req.params.postId, req.user.id);

    return res.json({ message: "Dislike added" });
}

exports.deleteDislike = async (req, res) => {
    const result = await ActivityService.isThisMyPost(req.params.postId, req.user.id)
    if (result) {
        return res.status(400).json({ error: 'You cannot remove dislike from your own post' });
    }

    const removeDislikeResult = await ActivityService.removeDislike(req.params.postId, req.user.id);

    return res.json({ message: "Dislike removed" });
}

exports.createComment = async (req, res) => {
    const commentCreationResult = await ActivityService.createComment(req.params.postId, req.user.id, req.body.message);

    return res.json({ message: "Comment created" });
}

exports.getComment = async (req, res) => {
    const comment = await ActivityService.getComment(req.params.postId, req.params.id);
    if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ data: comment });
}

exports.deleteComment = async (req, res) => {
    const comment = await ActivityService.getComment(req.params.postId, req.params.id);
    if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: 'You are not allowed to delete this comment' });
    }

    const deleteCommentResult = await ActivityService.deleteComment(req.params.postId, req.params.id);

    return res.json({ message: 'Comment deleted' });
}

exports.updateComment = async (req, res) => {
    const comment = await ActivityService.getComment(req.params.postId, req.params.id);
    if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (comment.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: 'You are not allowed to update this comment' });
    }

    const updateCommentResult = await ActivityService.updateComment(req.params.postId, req.params.id, req.body.message);

    return res.json({ message: 'Comment updated' });
}