import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const OFFLINE_ID_KEY = "octopus_offline_user_id";

const getStorage = () => {
  if (Platform.OS === "web") {
    return {
      getItem: async (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // ignore
        }
      },
    };
  }
  return AsyncStorage;
};

export async function getOrCreateOfflineUserId(): Promise<string> {
  const storage = getStorage();
  const existing = await storage.getItem(OFFLINE_ID_KEY);
  if (existing) return existing;
  const id = uuidv4();
  await storage.setItem(OFFLINE_ID_KEY, id);
  return id;
}

export async function clearOfflineUserId() {
  const storage = getStorage();
  try {
    await storage.setItem(OFFLINE_ID_KEY, "");
  } catch {
    // ignore
  }
}


