import MenuIcon from "@mui/icons-material/Menu";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Breadcrumbs, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Toolbar from "@mui/material/Toolbar";
import * as React from "react";
import UserDropdown from "../UserDropdown";
import styles from "./MainContainer.module.css";
import ConnectHeader from "../ConnectHeader";

interface Props {
  breadcrumbs?: React.ReactNode;
  children: React.ReactNode;
  title: string;
}

const drawerWidth = 320;

export default function MainContainer(props: Props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box sx={{ textAlign: "center", background: "#131313" }}>
      <div className={styles.logo}>
        <ConnectHeader title="Issuer-demo" />
      </div>
      <Divider />
      <List className={styles.drawerContainer} sx={{ marginTop:{xs:"4rem"} }}>
        <UserDropdown />
      </List>
    </Box>
  );

  return (
    <div>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar component="nav" className={styles.appBar}>
          <Toolbar className={styles.navigation}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" }, color: "white" }}
            >
              <MenuIcon />
            </IconButton>
            <div className={styles.logo}>
              <ConnectHeader title="Issuer-demo" />
            </div>
            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                position: "absolute",
                right: "1rem",
              }}
            >
              <UserDropdown />
            </Box>
          </Toolbar>
        </AppBar>
        <Box component="nav">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                background: "#131313",
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
      </Box>
      <Box
        component="div"
        sx={{ px: 3, pt: 3, display: "flex", justifyContent: "center" }}
      >
        {props.children}
      </Box>
    </div>
  );
}
