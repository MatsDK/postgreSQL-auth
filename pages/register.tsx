import Link from "next/link";
import axios from "axios";
import { useState } from "react";

const register: React.FC = (): JSX.Element => {
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (
      !userName.replace(/\s/g, "").length ||
      !email.replace(/\s/g, "").length ||
      !password.replace(/\s/g, "").length
    )
      return alert("input not valid");
    console.log(userName, email, password);

    axios({
      url: "http://localhost:3001/auth/register",
      method: "POST",
      data: { userName, email, password },
    }).then((res) => {
      console.log(res.data);
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
