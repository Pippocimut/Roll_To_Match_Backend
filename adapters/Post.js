const CommentAdapter = require('./Comment');
const UserAdapter = require('./User');
const postStatus = require('../types').postStatus;

exports.fromDatabaseRecord = (record) => {
    return {
        id: record._id,
        title: record.title,
        registeredAt: record.registeredAt,
        likes: record.likes.users.length,
        dislikes: record.dislikes.users.length,
        comments: record.comments.map(CommentAdapter.fromDatabaseRecord),
        topic: record.topic,
        message: record.message,
        expiresAt: record.expiresAt,
        status: record.expiresAt > new Date() ? postStatus.live : postStatus.expired,
        owner: UserAdapter.fromDatabaseRecord(record.owner)
    }
}