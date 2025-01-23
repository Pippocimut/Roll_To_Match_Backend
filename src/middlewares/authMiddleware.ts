import { verify } from 'jsonwebtoken';
import 'dotenv/config'

export function auth(req, res, next) {
    if (req.session && req.session.accessToken) {
        const verified = verify(req.session.accessToken, process.env.TOKEN_SECRET)
        if (verified && typeof verified === 'object' && 'id' in verified) {
            req.userId = verified.id
            return next()
        }
        return res.status(401).send({ message: 'Access denied' })
    }
    return res.status(401).send({ message: 'Access denied' })
}