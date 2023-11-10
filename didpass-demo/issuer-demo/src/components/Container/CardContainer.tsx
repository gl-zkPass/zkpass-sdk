import { Box } from "@mui/material";
import React, { CSSProperties } from "react";
import styles from "./CardContainer.module.css";

type Props = {
  style?: CSSProperties | undefined;
  children: React.ReactNode;
};

export default function CardContainer(props: Props) {
  return (
    <Box
      component="div"
      sx={{ width: { sm: "90vw", md: "50vw" } }}
      className={styles.cardContainer}
      style={props.style}
    >
      {props.children}
    </Box>
  );
}
