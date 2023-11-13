import Image from 'next/image';
import logo from '../../../public/images/logo.png';
import styles from './Header.module.css';

const Header = () => {
  return (
    <div className={styles.title_container}>
      <Image src={logo} alt="didPass Logo" className={styles.logo} />
      <h1 className={styles.title_text}>
        didPass
        <span className={styles.title_demo}> Verifier Demo</span>
      </h1>
    </div>
  )
};

export default Header;