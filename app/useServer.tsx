import notifee from "@notifee/react-native";
import {
  ResultCode,
  startActivityAsync,
} from "../modules/expo-intent-launcher/src/IntentLauncher";

import { useState } from "react";

import { Linking } from "react-native";
import { CheckboxPaymentResult, TerminalPaymentResult } from "./interfaces";
import {
  callPrivatBankApi,
  Exception,
  getDeviceInfo,
  getStorageData,
  showSnackbar,
  startForegroundService,
} from "./utils";

let ws: WebSocket | null = null;

let setIsConnectedRef: ((isConnected: boolean) => void) | null = null;

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
      try {
        const { amount } = JSON.parse(event.data);
        if (!amount) return;
        const storageData = await getStorageData();
        if (!storageData) throw new Exception("Параметри з'єднання відсутні");
        await Linking.openURL("checkboxterminalpaymentintegrator://");
        let response = await callPrivatBankApi("/token", {
          operation: "pay",
          amount: amount / 100,
          purpose: "Оплата за товари та послуги",
          client_token: storageData.token,
        });
        if (!response.success)
          throw new Exception(
            "Помилка отримання токена. Перевірте правильність введених данних",
            "Помилка виконання операції. Спробуйте виконати операцію ще раз"
          );
        const url = new URL("nfcterminal://executor");
        url.search = new URLSearchParams({ token: response.jwt }).toString();
        const intentResult = await startActivityAsync(
          "android.intent.action.VIEW",
          { data: url.toString() }
        );
        if (intentResult.resultCode === ResultCode.Canceled)
          throw new Exception("Оплата скасована", "Оплата скасована");
        response = await callPrivatBankApi("/check", { jwt: response.jwt });
        if (!response.success) {
          const message = `Помилка оплати. Код ${response.status}: ${response.message}`;
          throw new Exception(message, message);
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
        showSnackbar("Оплата успішна");
        ws?.send(JSON.stringify(payload));
      } catch (error: any) {
        console.log(error);
        if (error instanceof Exception) {
          if (error.clientMessage) showSnackbar(error.clientMessage);
          if (error.serverMessage) {
            const payload = { success: false, error: error.serverMessage };
            ws?.send(JSON.stringify(payload));
          }
        }
      }
    };
  };

  const disconnect = () => ws?.close();

  return { isConnected, connect, disconnect };
}
