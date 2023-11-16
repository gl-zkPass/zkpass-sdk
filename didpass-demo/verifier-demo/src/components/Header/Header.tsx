import Image from 'next/image';
import logo from '../../../public/images/logo.png';
import styles from './Header.module.css';
import Link from 'next/link';

const Header = () => {
  return (
    <div className={styles.title_container}>
      <Image src={logo} alt="didPass Logo" className={styles.logo} />
      <h1 className={styles.title_text}>
        <Link href='/'>
          didPass
          <span className={styles.title_demo}> Verifier Demo</span>
        </Link>
      </h1>
    </div>
  )
};

export default Header;