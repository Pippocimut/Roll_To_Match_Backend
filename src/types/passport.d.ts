import mongoose from 'mongoose'
import { PersistedUser } from '../database-models/User'

declare global {
  namespace Express {
    interface User extends mongoose.Document<any, any, PersistedUser> {}
  }
} 