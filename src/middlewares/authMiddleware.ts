import { verify } from 'jsonwebtoken';
import 'dotenv/config'

export function auth(req, res, next) {
    if (!req.headers['authorization']) {
        return res.status(401).send({ message: 'Access denied' })
    }

    const token = req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'Access denied' })
    }
    try {
        
        const verified = verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()
    } catch (err) {
        console.log(err)
        return res.status(401).send({ message: 'Invalid token or expired' })
    }
}