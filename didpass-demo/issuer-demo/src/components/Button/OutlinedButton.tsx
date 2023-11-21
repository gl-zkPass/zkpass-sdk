import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

const OutlinedButton = styled(Button)(({ theme }) => ({
  background: "transparent",
  border: "1px solid #ffffff",
  fontWeight: "bold",
  font: "roboto",
  borderRadius: 8,
  textAlign: "left",
  color: "#ffffff",
  height: "40px",
  right: "0",
  padding: "0 20px",
  ":disabled": {
    opacity: "0.3",
    color: "#1AFFF9",
  },
  textTransform: "none",
}));

export { OutlinedButton };
