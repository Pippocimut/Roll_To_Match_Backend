const ActivityService = require('../services/ActivityService');

exports.postLiveCheck = async (req, res, next) => {
    console.log(req.params.postId)
    const result = await ActivityService.isPostLive(req.params.postId)
    if (!result) {
        return res.status(400).json({ error: 'Post is not live' });
    }
    next();
}