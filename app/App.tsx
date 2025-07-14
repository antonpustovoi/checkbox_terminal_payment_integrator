import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Appbar, Button, Surface, Text, TextInput } from "react-native-paper";
import { Snackbar } from "./Snackbar";
import { useServer } from "./useServer";
import { getStorageData } from "./utils";

export function App() {
  const { isConnected, connect, disconnect } = useServer();

  const [values, setValues] = useState({
    ipAddress: "",
    token: "",
    clid: "",
    secret: "",
  });

  useEffect(() => {
    getStorageData().then((data) => {
      if (data) setValues(data);
    });
  }, []);

  const updateValues = (field: string, value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    AsyncStorage.setItem("data", JSON.stringify(nextValues));
  };

  const handlePress = () => {
    if (isConnected) disconnect();
    else connect();
  };

  const renderInput = (label: string, field: keyof typeof values) => (
    <TextInput
      mode="outlined"
      label={label}
      value={values[field]}
      disabled={isConnected}
      onChangeText={(value) => updateValues(field, value)}
    />
  );

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <Appbar.Header
        style={{ flexDirection: "column", justifyContent: "center" }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 20 }}>
          Checkbox + Термінал
        </Text>
        <Text style={{ fontWeight: "bold" }}>Платіжний інтегратор</Text>
      </Appbar.Header>
      <Surface
        style={{ flex: 1, padding: 12, justifyContent: "space-between" }}
      >
        <View />
        <View style={{ gap: 8 }}>
          {renderInput("IP адреса сервера", "ipAddress")}
          {renderInput("Токен Інтеграції", "token")}
          {renderInput("CLID", "clid")}
          {renderInput("Secret", "secret")}
        </View>
        <Button
          mode="contained"
          onPress={handlePress}
          style={{
            borderRadius: 12,
            backgroundColor: isConnected ? "#707070" : "#62d545",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              height: 32,
              fontWeight: "bold",
              verticalAlign: "middle",
              color: "#FFF",
            }}
          >
            {isConnected
              ? "Від'єднатись від сервера"
              : "Приєднатись до сервера"}
          </Text>
        </Button>
      </Surface>
      <Snackbar />
    </KeyboardAvoidingView>
  );
}
