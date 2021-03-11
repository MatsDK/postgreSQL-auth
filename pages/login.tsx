import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { NextRouter, useRouter } from "next/router";
import { useCookies } from "react-cookie";
import styles from "../css/index.module.css";

const login = (): JSX.Element => {
  const [cookie, setCookie] = useCookies(["jid"]);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router: NextRouter = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.replace(/\s/g, "").length || !password.replace(/\s/g, "").length)
      return alert("input not valid");

    axios({
      url: "http://localhost:3001/auth/login",
      method: "POST",
      data: { email, password },
    }).then((res) => {
      if (res.data.err) return alert(res.data.data);
      if (res.data.cookie)
        setCookie("jid", res.data.cookie, {
          maxAge: 7200,
        });
      if (res.data.redirect) router.push("/");
    });
  };

  return (
    <div>
      <div className={styles.navBar}>
        <div>
          <Link href="/">Home</Link>
          <Link href="/register">Register</Link>
          <Link href="/login">Login</Link>
        </div>
      </div>
      <form onSubmit={handleSubmit} className={styles.authForm}>
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default login;
