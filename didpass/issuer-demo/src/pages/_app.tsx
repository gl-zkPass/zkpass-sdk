import '@/styles/globals.css'
import { StyledEngineProvider } from "@mui/material";
import Head from "next/head";
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StyledEngineProvider injectFirst>
      <Head>
        <title>didPass Issuer Demo</title>
      </Head>
      <Component {...pageProps} />
    </StyledEngineProvider>
  );
}
