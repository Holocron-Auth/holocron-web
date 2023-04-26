import { NextApiRequest } from "next";
import { verifyJwt } from "src/utils/jwt";

interface ContextUser {
  id: string;
  name: string;
  email: string;
  iat: string;
  exp: number;
  image:string;
  phone:string;
  dob:string;
  emailVerified:Date;
  phoneVerified:Date;
}

export const getUserFromCookie = async (req: NextApiRequest) => {
  const cookie = req.cookies.token;

  if (!cookie) {
    return null;
  }

  try {
    return verifyJwt<ContextUser>(cookie);
  } catch (err) {
    return null;
  }
};
