import React from "react";
import Link from "next/link";

const Index: React.FC = (): JSX.Element => {
  return (
    <div>
      <Link href="/register">Register</Link>
      <Link href="/login">Login</Link>
    </div>
  );
};

export default Index;
