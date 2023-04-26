import jwt from "jsonwebtoken";
import { env } from "process";

const SECRET = env.JWT_TOKEN!;

export function signJwt(data: object) {
  return jwt.sign(data, SECRET);
}

export function verifyJwt<T>(token: string) {
  return jwt.verify(token, SECRET) as T;
}

export function decodeJwt<T>(token: string) {
  return jwt.decode(token) as T;
}
