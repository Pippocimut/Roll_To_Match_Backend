import mongoose from 'mongoose'
import { PersistedUser } from '../database-models/User'

declare global {
  namespace Express {
    interface Request {
      user?: mongoose.Document<any, any, PersistedUser>// Or specific types you want to allow
    }
  }
}
