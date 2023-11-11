import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { ThemeProvider, createTheme } from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import * as React from "react";
import styles from "./Toast.module.css";

const theme = createTheme({
  components: {
    // Name of the component
    MuiAlert: {
      defaultProps: {
        iconMapping: {
          success: (
            <CheckCircleOutlineIcon
              fontSize="inherit"
              sx={{ fill: "#2e7d32" }}
              color="success"
            />
          ),
          error: (
            <CancelOutlinedIcon
              fontSize="inherit"
              sx={{ fill: "#ED6A5E" }}
              color="error"
            />
          ),
        },
      },
    },
  },
});

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return (
    <ThemeProvider theme={theme}>
      <MuiAlert
        className={styles.alert}
        elevation={6}
        ref={ref}
        variant="filled"
        {...props}
      />
    </ThemeProvider>
  );
});

export type ToastConfig = {
  message: any;
  severity: "success" | "error";
  open: boolean;
};

type Props = {
  config: ToastConfig;
  handleClose: () => void;
};

const SNACKBAR_DURATION = 3000;
const Toast = ({ handleClose, config }: Props) => {
  return (
    <Snackbar
      sx={{
        "& .MuiAlert-action > button > svg": { fill: "var(--color-black)" },
      }}
      autoHideDuration={SNACKBAR_DURATION}
      anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      open={config.open}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={config.severity}
        sx={{ width: "100%" }}
      >
        {config.message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
