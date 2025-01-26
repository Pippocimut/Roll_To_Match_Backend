import { verify } from 'jsonwebtoken';
import 'dotenv/config'
import { UserModel } from 'database-models/User';

export async function auth(req, res, next) {
    if (req.session && req.session.accessToken) {
        const secretToken = process.env.TOKEN_SECRET
        if (!secretToken) {
            return res.status(400).send({ message: 'Secret token not found' })
        }
        const verified = verify(req.session.accessToken, secretToken)
        if (verified && typeof verified === 'object' && 'id' in verified) {
            req.user = await UserModel.findById(verified.id)
            return next()
        }
        return res.status(401).send({ message: 'Access denied' })
    }
    return res.status(401).send({ message: 'Access denied' })
}