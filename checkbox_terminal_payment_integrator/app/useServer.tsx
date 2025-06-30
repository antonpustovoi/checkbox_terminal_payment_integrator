import notifee from "@notifee/react-native";
import IntentLauncher from "@yz1311/react-native-intent-launcher";

import { useState } from "react";
import { Linking } from "react-native";

import { CheckboxPaymentResult, TerminalPaymentResult } from "./interfaces";
import {
  callPrivatBankApi,
  getDeviceInfo,
  getStorageData,
  showSnackbar,
  startForegroundService,
} from "./utils";

let ws: WebSocket | null = null;

let activeId = null;

let setIsConnectedRef: ((isConnected: boolean) => void) | null = null;

const processingIds = new Set();

export function useServer() {
  const [isConnected, setIsConnected] = useState(
    ws?.readyState === WebSocket.OPEN
  );

  setIsConnectedRef = (isConnected: boolean) => setIsConnected(isConnected);

  const connect = async () => {
    const storageData = await getStorageData();
    if (!storageData) {
      showSnackbar("Параметри з'єднання відсутні");
      return;
    }
    const { id, longDeviceName } = await getDeviceInfo();
    const queryString = new URLSearchParams({ id, deviceName: longDeviceName });
    ws = new WebSocket(
      `ws://${storageData.ipAddress}/api/pos/client?${queryString}`
    );

    const sendData = (data: object, userMessage: string) => {
      ws?.send(JSON.stringify(data));
      showSnackbar(userMessage);
    };

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      setIsConnectedRef?.(true);
      startForegroundService();
    };

    ws.onerror = (error: any) => {
      console.log("WebSocket error:", error);
      setIsConnectedRef?.(false);
      notifee.stopForegroundService();
      const message = error?.message
        ? `Помилка підключення: ${error.message}`
        : "З'єднання з сервером відсутнє. Перевірте підключення до серверу";
      showSnackbar(message);
    };

    ws.onclose = (error) => {
      console.log("WebSocket connection closed:", error.code, error.reason);
      setIsConnectedRef?.(false);
      notifee.stopForegroundService();
    };

    ws.onmessage = async (event) => {
      console.log("WebSocket message", event);
      const { amount } = JSON.parse(event.data);
      if (!amount) return;
      const storageData = await getStorageData();
      if (!storageData) {
        showSnackbar("Параметри з'єднання відсутні");
        return;
      }
      const id = Date.now();
      activeId = id;
      await Linking.openURL("checkboxpaybypbterminal://");
      let response = await callPrivatBankApi("/token", {
        operation: "pay",
        amount: amount / 100,
        purpose: "Оплата за товари та послуги",
        client_token: storageData.token,
      });
      if (!response.success) {
        const payload = {
          success: false,
          error:
            "Помилка виконання операції. Спробуйте виконати операцію ще раз",
        };
        const message =
          "Помилка отримання токена. Перевірте правильність введених данних";
        sendData(payload, message);
        return;
      }
      const url = new URL("nfcterminal://executor");
      url.search = new URLSearchParams({ token: response.jwt }).toString();
      processingIds.add(id);
      const intentResult = await IntentLauncher.startActivity({
        action: "android.intent.action.VIEW",
        category: "",
        data: url.toString(),
      });
      processingIds.delete(id);
      if (id !== activeId) return;
      if (!intentResult.extra) {
        const error = "Оплата скасована";
        sendData({ success: false, error }, error);
        return;
      }
      response = await callPrivatBankApi("/check", { jwt: response.jwt });
      if (!response.success) {
        const error = `Помилка оплати. Код ${response.status}: ${response.message}`;
        sendData({ success: false, error }, error);
        return;
      }
      const result = response.pay as TerminalPaymentResult;
      const payload = {
        success: true,
        result: {
          merchant_id: result.merchant,
          card_mask: result.masked_pan,
          rrn: result.rrn,
          auth_code: result.approval_code,
          date_time: result.date,
          payment_system: result.payment_system,
          bank_name: "Приватбанк",
        },
      } as CheckboxPaymentResult;
      sendData(payload, "Оплата успішна");
    };
  };

  const disconnect = () => ws?.close();

  return { isConnected, connect, disconnect };
}
