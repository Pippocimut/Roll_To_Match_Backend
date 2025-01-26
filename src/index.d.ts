import { PersistedUser } from './database-models'
import mongoose from 'mongoose'
import { Session } from 'express-session'
import session from 'express-session'

declare global {
  namespace Express {
    interface SessionData {
      accessToken: string;
    }
    interface Request {
      user?: mongoose.Document<PersistedUser>
    }
  }
}

declare module "express-session" {
  interface SessionData {
    accessToken: string;
  }
}