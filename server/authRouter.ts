import express, { Request, Response } from "express";
import db from "./db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import tokens from "./jwtTokens";

const router = express.Router();

interface dbUser {
  id: number;
  username: string;
  email: string;
  refresh_token?: string;
  password?: string;
  iat?: number;
  exp?: number;
}

router.post("/", (req: Request, res: Response) => {
  try {
    const cookie: string = req.body?.cookie?.jid;
    if (!cookie) return res.json({ isAuth: false });

    jwt.verify(
      cookie,
      process.env.ACCESS_TOKEN_SECRET!,
      async (err: any, user: any) => {
        if (!err) {
          delete user.iat, delete user.exp, delete user.refresh_token;
          return res.json({ isAuth: true, user });
        }

        const decodedCookie: any = jwt.decode(cookie);
        if (!decodedCookie.id) return res.json({ isAuth: false });

        const thisUserRes = await db.query(
          "SELECT * FROM person WHERE id = $1",
          [decodedCookie.id]
        );
        const userRefreshToken = thisUserRes.rows[0]?.refresh_token;
        jwt.verify(
          userRefreshToken,
          process.env.REFRESH_TOKEN_SECRET!,
          (err: any, dbUser: any) => {
            if (err) res.json({ isAuth: false });

            delete dbUser.iat, delete dbUser.exp;
            const accessToken = tokens.generateAccessToken(dbUser);
            res.json({ isAuth: true, cookie: accessToken, user: dbUser });
          }
        );
      }
    );
  } catch (err) {
    return res.json({ err: true, data: err.message });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      userName,
      email,
      password,
    }: { userName: string; email: string; password: string } = req.body;

    const users = await db.query("SELECT * FROM person", []);
    if (
      users.rows.find((x: any) => x.email.toLowerCase() === email.toLowerCase())
    )
      return res.json({
        err: true,
        data: "user with that email already exists",
      });

    const hashedPassword: string = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO person (id, username, email, password) 
      VALUES (nextval('person_sequence'), $1, $2, $3 ) RETURNING * `,
      [userName, email, hashedPassword]
    );
    res.json({ err: false, redirect: true });
  } catch (err) {
    return res.json({ err: true, data: err.message });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    const dbSearch = await db.query("SELECT * FROM person WHERE email=$1", [
      email,
    ]);
    const thisUser: dbUser = dbSearch.rows[0];
    if (!thisUser)
      return res.json({ err: true, data: "User not found", redirect: false });

    bcrypt.compare(
      password,
      thisUser.password,
      async (err: undefined | string, isCorrect: boolean) => {
        if (err) throw err;
        if (!isCorrect)
          return res.json({
            err: true,
            data: "Password is incorrect",
            redirect: false,
          });

        delete thisUser.password, delete thisUser.refresh_token;
        const accessToken = tokens.generateAccessToken(thisUser);
        const refreshToken = tokens.generateRefreshToken(thisUser);

        await db.query("UPDATE person SET refresh_token = $1 WHERE id = $2", [
          refreshToken,
          thisUser.id,
        ]);

        res.json({ err: false, redirect: true, cookie: accessToken });
      }
    );
  } catch (err) {
    return res.json({ err: true, data: err.message });
  }
});

export default router;
