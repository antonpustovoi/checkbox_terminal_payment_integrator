import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getDeviceName,
  getManufacturer,
  getModel,
  getUniqueId,
} from "react-native-device-info";
import { sha1 } from "react-native-sha256";
import Snackbar from "react-native-snackbar";

export const callPrivatBankApi = async (path: string, payload: object) => {
  const data = await AsyncStorage.getItem("data");
  const { clid, secret } = JSON.parse(data ?? "");
  const signed = Math.trunc(Date.now() / 1000);
  const signature = await sha1(
    `${signed}${secret}${JSON.stringify(payload)}${secret}`
  );
  const response = await fetch(
    `https://dio.privatbank.ua/api/nfcpos/integrators${path}.php?clid=${clid}&signed=${signed}&signature=${signature}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.json();
};

export const startForegroundService = async () => {
  const settings = await notifee.getNotificationSettings();
  if (settings.authorizationStatus === AuthorizationStatus.DENIED) return;
  const channelId = await notifee.createChannel({
    id: "default",
    name: "Default Channel",
    importance: AndroidImportance.HIGH,
  });
  await notifee.displayNotification({
    title: "Checkbox + Термінал — платіжний інтегратор",
    body: "З'єднання з сервером встановлено",
    android: {
      channelId,
      asForegroundService: true,
      ongoing: true,
      importance: AndroidImportance.HIGH,
    },
  });
};

export const showSnackbar = (message: string) =>
  Snackbar.show({
    text: message,
    duration: Snackbar.LENGTH_LONG,
    action: {
      text: "Закрити",
      textColor: "green",
      onPress: () => Snackbar.dismiss(),
    },
  });

export const getDeviceInfo = async () => {
  const id = await getUniqueId();
  const deviceName = await getDeviceName();
  const manufacturer = await getManufacturer();
  const model = getModel();
  const longDeviceName = `${deviceName} (Manufacturer: ${manufacturer}, Model: ${model})`;
  return { id, longDeviceName };
};

export const getStorageData = async () => {
  const data = await AsyncStorage.getItem("data");
  return data ? JSON.parse(data) : null;
};

export class Exception extends Error {
  serverMessage: string | null = null;
  clientMessage: string | null = null;

  constructor(clientMessage?: string, serverMessage?: string) {
    super(clientMessage);
    this.clientMessage = clientMessage ?? null;
    this.serverMessage = serverMessage ?? null;
  }
}
