import { verify } from 'jsonwebtoken';
import 'dotenv/config'

export function auth(req, res, next) {
    if (req.session && req.session.accessToken) {
        const verified = verify(req.session.accessToken, process.env.TOKEN_SECRET)
        req.user = verified
        console.log(verified)
        return next()
    }
    return res.status(401).send({ message: 'Access denied' })
}