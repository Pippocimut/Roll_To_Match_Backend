import { Request } from 'express'
import { PersistedUser } from './database-models'
import mongoose from 'mongoose'

declare global {
  namespace Express {
    interface Request {
      user?: mongoose.Document<PersistedUser>
    }
  }
}