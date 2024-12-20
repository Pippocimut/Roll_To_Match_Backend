const jsonwebtoken = require('jsonwebtoken')
require('dotenv').config()

module.exports = function auth(req, res, next) {
    if (!req.headers['authorization']) {
        return res.status(401).send({ message: 'Access denied' })
    }

    const token = req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'Access denied' })
    }
    try {
        const verified = jsonwebtoken.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()
    } catch (err) {
        console.log(err)
        return res.status(401).send({ message: 'Invalid token or expired' })
    }
}