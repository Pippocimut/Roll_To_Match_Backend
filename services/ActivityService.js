const Post = require('../models/Post');
const postStatus = require('../types').postStatus;
const CommentAdapter = require('../adapters/Comment');
const PostAdapter = require('../adapters/Post');

exports.giveLike = async function giveLike(postId, userId) {
    return Post.findByIdAndUpdate(postId, {
        $addToSet: {
            "likes.users": userId
        }
    })
}

exports.removeLike = async function removeLike(postId, userId) {
    return Post.findByIdAndUpdate(postId, {
        $pull: {
            "likes.users": userId
        }
    })
}

exports.giveDislike = async function giveDislike(postId, userId) {
    return Post.findByIdAndUpdate(postId, {
        $addToSet: {
            "dislikes.users": userId
        }
    })
}

exports.removeDislike = async function removeDislike(postId, userId) {
    return Post.findByIdAndUpdate(postId, {
        $pull: {
            "dislikes.users": userId
        }
    })
}

exports.isThisMyPost = async function isThisMyPost(postId, userId) {
    return Post.findById(postId).then((post) => {
        if (post.owner.toString() === userId.toString()) {
            return true;
        } else {
            return false;
        }
    })
}

exports.isPostLive = async function isPostLive(postId) {
    return await Post.findById(postId).then((post) => {
        if (!post) {
            const error = new Error('Post not found');
            error.status = 404;
            throw error;
        }

        const adaptedPost = PostAdapter.fromDatabaseRecord(post);

        if (adaptedPost.status === postStatus.live) {
            return true;
        }

        return false;
    })
}

exports.createComment = async function createComment(postId, userId, message) {
    return await Post.findByIdAndUpdate(postId, {
        $push: {
            comments: {
                user: userId,
                message: message
            }
        }
    }, { new: true })
}

exports.getComment = async function getComment(postId, commentId) {
    const comment = await Post.findById(postId).comments.id(commentId);

    return CommentAdapter.fromDatabaseRecord(comment);
}

exports.deleteComment = async function deleteComment(postId, commentId) {
    return await Post.findByIdAndUpdate({
        _id: postId,
        "comments._id": commentId
    },
        {
            $pull: {
                "comments": { _id: commentId }
            }
        }, { new: true })
}

exports.updateComment = async function updateComment(postId, commentId, message) {
    return await Post.findOneAndUpdate({
        _id: postId,
        "comments._id": commentId
    }, {
        $set: {
            "comments.$.message": message
        }
    }, { new: true })
}

