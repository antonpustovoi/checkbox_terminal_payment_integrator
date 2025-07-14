import { useState } from "react";
import { Snackbar as ReactNativePaperSnackbar } from "react-native-paper";

let showSnackbar: (message: string, variant?: "success" | "error") => void;

export function Snackbar() {
  const [message, setMessage] = useState("");

  const [variant, setVariant] = useState<"success" | "error">("success");

  showSnackbar = (message: string, variant?: "success" | "error") => {
    setMessage(message);
    setVariant(variant ?? "error");
  };

  return (
    <ReactNativePaperSnackbar
      visible={Boolean(message)}
      onDismiss={() => setMessage("")}
      action={{ label: "Закрити" }}
      theme={{
        colors: {
          inverseSurface: variant === "success" ? "#388E3C" : "#D32F2F",
          inverseOnSurface: "#FFF",
          inversePrimary: "#FFF",
        },
      }}
    >
      {message}
    </ReactNativePaperSnackbar>
  );
}

export function useSnackbar() {
  return {
    showSnackbar: (message: string, variant?: "success" | "error") =>
      showSnackbar(message, variant),
  };
}
