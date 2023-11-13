import type { AppProps } from 'next/app';
import './styles/globals.css';
import Header from '../components/Header/Header';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className='verifier-container'>
      <Header />
      <div className="content-container">
        <Component {...pageProps} />
      </div>
    </main>
  )
}