import { verify } from 'jsonwebtoken';
import 'dotenv/config'
import { UserModel } from 'database-models/User';

export async function auth(req, res, next) {
    console.log("Session from auth", JSON.stringify(req.session, null, 2))
    if (req.session && req.session.accessToken) {
        const secretToken = process.env.TOKEN_SECRET
        if (!secretToken) {
            res.status(400).send({ message: 'Secret token not found' })
            return
        }
        try {
            const verified = verify(req.session.accessToken, secretToken)
            if (verified && typeof verified === 'object' && 'id' in verified) {
                console.log(verified)
                req.user = await UserModel.findById(verified.id)
                res.locals.user = req.user
                return next()
            }
        } catch (e) {
            console.log(e)
        }
    }
    res.status(401).send({ message: 'Unauthorized' })
    return
}