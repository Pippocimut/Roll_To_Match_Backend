const PostService = require('../services/PostService');

exports.createPost = async (req, res, next) => {
    const createdPost = await PostService.createPost(req.user.id, req.body);

    res.status(201).json({ message: "Post created" });
}

exports.getPosts = async (req, res) => {
    const filterTopic = req.query.topic ? req.query.topic : null;
    const filterStatus = req.query.status ? req.query.status : null;
    const filterHighestInterests = req.query.highestInterest ? req.query.highestInterest : null;

    const posts = await PostService.getPosts(filterTopic, filterStatus, filterHighestInterests)

    res.json({ data: posts });
}

exports.getPost = async (req, res) => {
    const post = await PostService.getPost(req.params.id);

    res.json({ data: post });
}

exports.updatePost = async (req, res) => {
    const post = await PostService.getPost(req.params.id);

    if (post.owner.id.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: 'You are not allowed to update this post' });
    }

    const updatePost = await PostService.updatePost(req.params.id, req.body);

    res.json({ message: 'Post updated' });
}

exports.deletePost = async (req, res) => {
    const post = await PostService.getPost(req.params.id);

    if (post.owner.id.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: 'You are not allowed to update this post' });
    }

    const deletedPost = await PostService.deletePost(req.params.id);

    res.json({ message: 'Post deleted' });
}