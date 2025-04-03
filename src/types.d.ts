import "express";

declare module "express" {
  interface Request {
    t: (key: string) => string;
  }
}
