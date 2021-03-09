import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import { NextRouter, useRouter } from "next/router";

const register: React.FC = (): JSX.Element => {
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router: NextRouter = useRouter();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (
      !userName.replace(/\s/g, "").length ||
      !email.replace(/\s/g, "").length ||
      !password.replace(/\s/g, "").length
    )
      return alert("Input not valid");

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
      <Link href="/">Home</Link>
      <Link href="/login">Login</Link>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default register;
