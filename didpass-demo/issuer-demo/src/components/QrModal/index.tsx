import { Modal } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { QR } from "@/backend/types/QR";
import { OutlinedButton } from "../Button/OutlinedButton";
import ShowQr from "../ShowQr";
import styles from "./Modal.module.css";
import { QrModalConfig } from "@/backend/types/QRModalConfig";

type Props = {
  config: QrModalConfig;
  handleClose: () => void;
  qr: QR;
};

const QrModal = ({ config, handleClose, qr }: Props) => {
  return (
    <Modal
      className={styles.modalSize}
      open={config.open}
      onClose={handleClose}
    >
      <Box className={styles.qrModal}>
        <div className={styles.titleContainer}>
          <Typography variant="h6" component="h2" className={styles.title}>
            {config.title}
          </Typography>
        </div>
        <div className={styles.container}>
          <div className={styles.bodyContainer}>
            <ShowQr
              size={300}
              qr={qr}
              qrConnect={false}
              description={config.description}
              note={config.note}
              purpose={config.purpose}
            />
          </div>
          <div className={styles.footer}>
            <OutlinedButton
              onClick={handleClose}
              sx={{
                borderRadius: "8px",
                height: "46px",
                border: "1px solid var(--color-aqua)",
                color: "var(--color-aqua)",
              }}
            >
              Back
            </OutlinedButton>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default QrModal;
