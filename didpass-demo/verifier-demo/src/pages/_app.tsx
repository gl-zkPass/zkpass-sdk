import type { AppProps } from 'next/app';
import './styles/globals.css';
import Header from '../components/Header/Header';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className='verifier-container'>
      <Head>
        <title>didPass Verifier Demo</title>
      </Head>
      <Header />
      <div className="content-container">
        <Component {...pageProps} />
      </div>
    </main>
  )
}