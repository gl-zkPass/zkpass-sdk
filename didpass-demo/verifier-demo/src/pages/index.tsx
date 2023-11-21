import { useRouter } from 'next/router';
import styles from './index.module.css';

const Homepage = () => {
  const router = useRouter();

  const handleStartDemo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/verifier');
  };

  return (
    <main className={styles.container}>
      <h2 className={styles.title}>Welcome to the Verifier Demo!</h2>
      <p className={styles.description}>
        This is a simple demo of the <span className={styles.description_highlight}> Verifier</span>, where you are able to observe the flow of the verification process. <br />To start, press the <b>Start Demo</b> button!
      </p>
      <button onClick={handleStartDemo} className={styles.start_button}>
        Start Demo
      </button>
    </main>
  );
};

export default Homepage;