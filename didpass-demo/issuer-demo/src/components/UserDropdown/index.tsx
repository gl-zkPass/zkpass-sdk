import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Stack from "@mui/material/Stack";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import * as React from "react";
import { getToken, removeUserCookie } from "@/utils/cookie";
import { OutlinedButton } from "../Button/OutlinedButton";
import Toast, { ToastConfig } from "../Toast";
import styles from "./UserDropdown.module.css";

const UserDropdown = () => {
  const [open, setOpen] = React.useState(false);

  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const userCookie = Cookies.get("_user");
  const [wildcardDid, setWildcardDid] = React.useState("");
  const [last4chars, setLast4chars] = React.useState("");
  const [toastConfig, setToastConfig] = React.useState<ToastConfig>({
    message: "",
    severity: "success",
    open: false,
  });
  const router = useRouter();

  React.useEffect(() => {
    if (userCookie) {
      let originalString = JSON.parse(userCookie).did;
      let last4chars = originalString.slice(-4);
      let prefixLength = originalString.lastIndexOf(":") + 1;
      let wildcardDid =
        originalString.substring(0, prefixLength) + "..." + last4chars;
      setLast4chars(last4chars);
      setWildcardDid(wildcardDid);
    }
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const disconnect = async () => {
    const token = getToken();
    await fetch(`/api/issuer/disconnect`, {
      method: "POST",
    });
  };

  const handleDisconnect = (event: Event | React.SyntheticEvent) => {
    handleClose(event);
    disconnect();
    removeUserCookie();
    router.push("/");
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const copyIdenfifier = () => {
    if (userCookie) {
      navigator.clipboard.writeText(JSON.parse(userCookie).did);
      setToastConfig({
        severity: "success",
        message: (
          <div className={styles.blackFont}>
            <b className={styles.blackFont}>Identifier</b> copied to your
            clipboard.
          </div>
        ),
        open: true,
      });
    }
  };

  const handleToastClose = () => {
    setToastConfig({
      ...toastConfig,
      open: false,
    });
  };

  return (
    <Stack direction="row" spacing={2}>
      <Toast handleClose={handleToastClose} config={toastConfig} />
      <div>
        <OutlinedButton
          ref={anchorRef}
          id="composition-button"
          aria-controls={open ? "composition-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          className={styles.userButton}
          onClick={handleToggle}
        >
          <>Welcome, {last4chars}</>
        </OutlinedButton>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-start"
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === "bottom-start" ? "left top" : "left bottom",
              }}
            >
              <Paper
                sx={{
                  backgroundColor: "var(--color-gray-400)",
                  borderRadius: "12px",
                }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem
                      className={`${styles.menuItem} ${styles.identifier}`}
                      onClick={copyIdenfifier}
                    >
                      <div className={styles.userContainer}>
                        <p className={styles.copyIdentifierText}>
                          Click to copy identifier
                        </p>

                        <p className={styles.identifierText}>{wildcardDid}</p>
                      </div>
                    </MenuItem>

                    <MenuItem
                      className={styles.menuItem}
                      onClick={handleDisconnect}
                    >
                      Disconnect
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </Stack>
  );
};

export default UserDropdown;
