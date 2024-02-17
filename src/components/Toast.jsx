import React from "react";
import Snackbar from "@mui/material/Snackbar";

export const Toast = ({ message, open, setOpen }) => {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={open}
      onClose={handleClose}
      message={message}
      autoHideDuration={3000}
    />
  );
};
