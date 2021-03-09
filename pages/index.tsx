import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import cookie from "cookie";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useCookies } from "react-cookie";

interface userObject {
  id: number;
  username: string;
  email: string;
}

interface indexProps {
  isAuth: boolean;
  user: userObject;
  cookie?: string;
}

const Index = (props: indexProps): JSX.Element => {
  const [cookie, setCookie] = useCookies(["jid"]);
  const [isAuth] = useState<boolean>(props.isAuth);

  useEffect(() => {
    if (props.cookie)
      setCookie("jid", props.cookie, {
        maxAge: 7200,
      });
  }, []);

  return (
    <div>
      <div>
        <Link href="/register">Register</Link>
        {!isAuth ? <Link href="/login">Login</Link> : <div>logout</div>}
      </div>
      {isAuth && <p>Logged in as {props.user.username}</p>}
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

export default Index;
