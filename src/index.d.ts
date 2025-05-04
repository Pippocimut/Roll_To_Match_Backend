import { PersistedUser } from './database-models'
import mongoose from 'mongoose'

declare global {
  namespace Express {
    interface SessionData {
      accessToken: string;
    }
    interface User extends mongoose.Document<any, any, PersistedUser> {}
    interface Request {
      user?: User; // Links it to the global User definition
    }
  }
}
declare module "express-session" {
  interface SessionData {
    accessToken: string;
  }
}