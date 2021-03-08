import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { NextRouter, useRouter } from "next/router";
import { useCookies } from "react-cookie";

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
      if (res.data.cookie) {
        console.log(cookie);
        setCookie("jid", res.data.cookie, {
          maxAge: 7200,
        });
      }
      if (res.data.redirect) router.push("/");
    });
  };

  return (
    <div>
      <Link href="/">Home</Link>
      <Link href="/register">Register</Link>
      <form onSubmit={handleSubmit}>
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
