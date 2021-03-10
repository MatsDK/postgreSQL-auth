import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import db from "../db";
import tokens from "../jwtTokens";

interface authExpressReq extends Request {
  cookie?: string;
  user?: object;
  body: any;
}

const isAuth = (req: authExpressReq, res: Response, next: NextFunction) => {
  try {
    const cookie: string = req.body?.cookie?.jid;
    if (!cookie) return res.json({ isAuth: false });

    jwt.verify(
      cookie,
      process.env.ACCESS_TOKEN_SECRET!,
      async (err: any, user: any) => {
        if (!err) {
          delete user.iat, delete user.exp, delete user.refresh_token;
          req.user = user;
          return next();
        }

        const decodedCookie: any = jwt.decode(cookie);
        if (!decodedCookie.id) return res.json({ isAuth: false });

        const thisUserRes = await db.query(
          "SELECT * FROM person WHERE id = $1",
          [decodedCookie.id]
        );
        const userRefreshToken = thisUserRes.rows[0]?.refresh_token;
        if (!thisUserRes || !userRefreshToken)
          return res.json({ isAuth: false });

        jwt.verify(
          userRefreshToken,
          process.env.REFRESH_TOKEN_SECRET!,
          (err: any, dbUser: any) => {
            if (err) return res.json({ isAuth: false });

            delete dbUser.iat, delete dbUser.exp;
            const accessToken = tokens.generateAccessToken(dbUser);
            (req.cookie = accessToken), (req.user = dbUser);
            return next();
          }
        );
      }
    );
  } catch (err) {
    return res.json({ err: true, data: err.message, isAuth: false });
  }
};

export { isAuth };
