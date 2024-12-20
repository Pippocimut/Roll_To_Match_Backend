const Post = require('../models/Post');
const PostAdapter = require('../adapters/Post');
const postStatuses = require('../types').postStatus;

exports.createPost = async (userId, post) => {
    return await Post.create({
        title: post.title,
        topic: post.topic,
        message: post.message,
        owner: userId,
        expiresAt: new Date(new Date().getTime() + 5 * 60 * 1000) // 5 minutes from now
    })
}

exports.getPosts = async (
    topic = null,
    postStatus = null,
    highestInterest = null
) => {
    const filterTopic = topic ? { topic: topic } : null;

    const filterStatus = postStatus ? (postStatus === postStatuses.live ? {
        expiresAt: { $gt: new Date() }
    } : {
        expiresAt: { $lt: new Date() }
    }) : null;

    const filterHighestInterests = highestInterest ? { topic: highestInterest } : null;

    const pipeline = [
        {
            $match: {
                _id: { $exists: 1 }
            }
        }
    ]

    if (filterTopic) {
        pipeline.push({ $match: filterTopic });
    }
    if (filterStatus) {
        pipeline.push({ $match: filterStatus });
    }
    if (filterHighestInterests) {
        pipeline.push({
            $addFields: {
                totalInterests: {
                    $add: [
                        { $size: "$likes.users" },
                        { $size: "$dislikes.users" }
                    ]
                }
            }
        });
        pipeline.push({ $sort: { totalInterests: -1 } });
        pipeline.push({ $limit: 1 });
    }

    const posts = await Post.aggregate(pipeline).exec()
    
    const populatedPostsOwners = await Post.populate(posts, { path: 'owner' });
    const populatedPostsCommentsUsers = await Post.populate(populatedPostsOwners, { path: 'comments.user' });

    return populatedPostsCommentsUsers.map(PostAdapter.fromDatabaseRecord);
}

exports.getPost = async (id) => {
    const post = await Post.findById(id)
    if (!post) {
        const error = new Error('Post not found');
        error.status = 404;
        throw error;
    }

    const populatedPostOwner = await Post.populate(post, { path: 'owner' });
    const populatedPostCommentsUsers = await Post.populate(populatedPostOwner, { path: 'comments.user' });

    return PostAdapter.fromDatabaseRecord(populatedPostCommentsUsers);
}

exports.updatePost = async (id, partialPost) => {
    const post = await Post.findById(id);
    if (!post) {
        const error = new Error('Post not found');
        error.status = 404;
        throw error;
    }

    post.title = partialPost.title || post.title;
    post.topic = partialPost.topic || post.topic;
    post.message = partialPost.message || post.message;

    return post.save();
}

exports.deletePost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        const error = new Error('Post not found');
        error.status = 404;
        throw error;
    }
    return post.remove();
}