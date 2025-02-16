import { verify } from 'jsonwebtoken';
import 'dotenv/config'
import { UserModel } from 'database-models/User';

export async function loadUser(req, res, next) {
    if (req.session && req.session.accessToken) {
        const secretToken = process.env.TOKEN_SECRET
        if (!secretToken) {
            return next()
        }
        try {
            const verified = verify(req.session.accessToken, secretToken)
            if (verified && typeof verified === 'object' && 'id' in verified) {
                req.user = await UserModel.findById(verified.id)
                res.locals.user = req.user
                return next()
            }
        } catch (e) { }
    }
    next()
}