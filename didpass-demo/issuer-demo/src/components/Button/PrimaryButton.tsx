import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: "#1AFFF9",
  border: 0,
  fontWeight: "bold",
  font: "opensans",
  borderRadius: 24,
  color: "#000000",
  height: "40px",
  right: "0",
  padding: "0 20px",
  "&:hover": {
    background: "var(--white)",
  },
  ":disabled": {
    background: "var(--color-aqua)",
    color: "#000000",
    opacity: "0.3",
  },
  textTransform: "none",
}));

export { PrimaryButton };
