import Constants from "expo-constants";
import { Platform } from "react-native";

const envBase = process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined;
const extraBase = (Constants.expoConfig?.extra as any)?.API_BASE_URL as
  | string
  | undefined;

const defaultBase = Platform.select({
  android: "http://192.168.1.136:5000",
  ios: "http://localhost:5000",
  default: "http://localhost:5000",
});

export const API_BASE_URL = envBase || extraBase || defaultBase!;
