const UserAdapter = require('./User');

exports.fromDatabaseRecord = (record) => {
    return {
        by: UserAdapter.fromDatabaseRecord(record.user),
        message: record.message,
        leftAt: record.registreatedAt
    }
}