import { useRouter } from 'next/router';
import styles from './index.module.css';

const SuccessPage = () => {
  const router = useRouter();
  const success = router.query.success;

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{success ? 'Congratulations!' : 'Unfortunately,'} the verification process was</h2>
      <h3 className={styles.result} style={{ color: success ? 'lightgreen' : 'red' }}>{success ? 'SUCCESSFUL' : 'UNSUCCESSFUL'}</h3>
      <button className={styles.button} onClick={() => router.push('/')}>Back to Home</button>
    </section>
  );
};

export default SuccessPage;