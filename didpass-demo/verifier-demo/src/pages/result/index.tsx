import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './index.module.css';

const SuccessPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState<boolean>(router.query.success === 'success');

  useEffect(() => {
    const success = router.query.success;
    setStatus(success === 'true');
  }, [router.query.success]);

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{status ? 'Congratulations!' : 'Unfortunately,'} the verification process was</h2>
      <h3 className={styles.result} style={{ color: status ? 'lightgreen' : 'red' }}>{status ? 'SUCCESSFUL' : 'UNSUCCESSFUL'}</h3>
      <button className={styles.button} onClick={() => router.push('/')}>Back to Home</button>
    </section>
  );
};

export default SuccessPage;