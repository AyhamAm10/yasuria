import { User } from "../entity/Users"; 

declare global {
  namespace Express {
    interface Request {
      currentUser?: User
    }
  }
}
