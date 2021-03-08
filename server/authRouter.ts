import express, { Request, Response } from "express";
import db from "./db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

interface dbUser {
  id: number;
  username: string;
  email: string;
  password?: string;
}

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
    const dbRes = await db.query(
      "INSERT INTO person (id, username, email, password) VALUES (nextval('person_sequence'), $1, $2, $3 ) RETURNING * ",
      [userName, email, hashedPassword]
    );
    const newUser: dbUser[] = dbRes.rows[0];

    console.log(newUser);
    res.json({ msg: "test" });
  } catch (err) {
    return res.json({ err: true, data: err.message });
  }
});

const secret =
  "4d9d57a264789ca52115d4942a8b4bcb5baac184f0b934bf8dcd84dce75b967725ddbbbb047bdbfbe0986744081aece855f1c60e5978cb07e36b710fd4f9df8e";

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
      (err: undefined | string, isCorrect: boolean) => {
        if (err) throw err;
        if (!isCorrect)
          return res.json({
            err: true,
            data: "Password is incorrect",
            redirect: false,
          });

        delete thisUser.password;
        const accessToken = jwt.sign(thisUser, secret, {
          expiresIn: "2h",
        });

        res.json({ err: false, redirect: true, cookie: accessToken });
      }
    );
  } catch (err) {
    console.log(err.message);
  }
});

export default router;
