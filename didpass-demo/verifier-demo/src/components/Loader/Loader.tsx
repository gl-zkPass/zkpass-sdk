import styles from './Loader.module.css';

const Loader = () => {
  return (
    <div className={styles.container}>
      <p className={styles.text}>Retrieving QR ...</p>
      <div className={styles.spinner}>
      </div>
    </div>
  )
};

export default Loader;