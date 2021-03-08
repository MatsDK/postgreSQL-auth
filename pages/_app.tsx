import * as React from "react";
import { AppProps } from "next/app";
import "../css/global.css";

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
}
