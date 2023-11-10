import Image from "next/image";
import Logo from "../../../public/images/logo.png";
import styles from "./ConnectHeader.module.css";

type Props = {
  title: string;
};

const ConnectHeader = (props: Props) => {
  return (
    <div className={styles.navigationParent} data-testid="connect-navbar">
      <div className={styles.navigation}>
        <div className={styles.logo}>
          <Image className={styles.logoIcon} src={Logo} alt="didPass logo" />
          <b className={styles.ssiid}>didPass</b>
          <i>{props.title}</i>
        </div>
      </div>
    </div>
  );
};

export default ConnectHeader;
