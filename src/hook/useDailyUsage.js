import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../services/Firebase";

export default function useDailyUsage(storageKey, limitLoggedIn, limitGuest) {
  const [usageCount, setUsageCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const storedUsage = await AsyncStorage.getItem(storageKey);
      const lastUsed = await AsyncStorage.getItem(`${storageKey}LastUsed`);
      const today = new Date().toISOString().split("T")[0];

      if (lastUsed !== today) {
        await AsyncStorage.setItem(storageKey, "0");
        await AsyncStorage.setItem(`${storageKey}LastUsed`, today);
        setUsageCount(0);
      } else {
        setUsageCount(storedUsage ? parseInt(storedUsage, 10) : 0);
      }

      setIsLoggedIn(!!auth.currentUser);
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
    });

    initialize();

    return () => unsubscribe();
  }, [storageKey]);

  const incrementUsage = async () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    await AsyncStorage.setItem(storageKey, newCount.toString());
    const today = new Date().toISOString().split("T")[0];
    await AsyncStorage.setItem(`${storageKey}LastUsed`, today);
  };

  const limit = isLoggedIn ? limitLoggedIn : limitGuest;

  return { usageCount, limit, incrementUsage, isLoggedIn };
}
