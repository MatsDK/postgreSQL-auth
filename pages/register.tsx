import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import { NextRouter, useRouter } from "next/router";
import styles from "../css/index.module.css";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import cookie from "cookie";

const register = (props: any): JSX.Element => {
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const router: NextRouter = useRouter();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (
      !userName.replace(/\s/g, "").length ||
      !email.replace(/\s/g, "").length ||
      !password.replace(/\s/g, "").length ||
      !password2.replace(/\s/g, "").length
    )
      return alert("Input not valid");
    if (password !== password2) return alert("passwords don't match");

    axios({
      url: "http://localhost:3001/auth/register",
      method: "POST",
      data: { userName, email, password },
    }).then((res) => {
      if (res.data.err) return alert(res.data.data);
      if (res.data.redirect) router.push("/login");
    });
  };

  return (
    <div>
      <div className={styles.navBar}>
        <div>
          <Link href="/">Home</Link>
          <Link href="/register">Register</Link>
          {!props.isAuth && <Link href="/login">Login</Link>}
        </div>
        {props.isAuth && <p>Logged in as {props.user.username}</p>}
      </div>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <input
          type="text"
          placeholder="username"
          defaultValue={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="email"
          placeholder="email"
          defaultValue={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          defaultValue={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="confirm password"
          defaultValue={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

const parseCookies = (req: any) => {
  return cookie.parse(req ? req.headers.cookie || "" : document.cookie);
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const res = await axios({
    url: "http://localhost:3001/auth/",
    method: "POST",
    data: { cookie: parseCookies(ctx.req) },
  });
  if (res.data.err) console.log(res.data.data);

  return {
    props: { ...res.data },
  };
};

export default register;
