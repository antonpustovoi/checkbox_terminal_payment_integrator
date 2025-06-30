import { KeyboardProvider } from "react-native-keyboard-controller";
import { MD3DarkTheme, PaperProvider } from "react-native-paper";
import { App } from "./App";

export default function Index() {
  return (
    <PaperProvider theme={MD3DarkTheme}>
      <KeyboardProvider>
        <App />
      </KeyboardProvider>
    </PaperProvider>
  );
}
