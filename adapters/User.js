exports.fromDatabaseRecord = (record) => {
    return {
        username: record.username,
    }
}