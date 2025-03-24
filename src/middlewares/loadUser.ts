import { verify } from 'jsonwebtoken';
import 'dotenv/config'
import { UserModel } from 'database-models/User';

export async function loadUser(req, res, next) {
    const authorization = req.header('authorization')
    if (!authorization) {
        return next()
    }

    const token = authorization.split(' ')[1]

    if (token) {
        const secretToken = process.env.TOKEN_SECRET
        if (!secretToken) {
            console.error('Secret token not found')
            return next()
        }
        try {
            const verified = verify(token, secretToken)
            if (verified && typeof verified === 'object' && 'id' in verified) {
                req.user = await UserModel.findById(verified.id)
                res.locals.user = req.user
                return next()
            }
        } catch (e) { }
    }
    next()
}