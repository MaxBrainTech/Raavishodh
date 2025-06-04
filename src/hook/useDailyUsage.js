import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../services/Firebase";

export default function useDailyUsage(baseKey, limitLoggedIn, limitGuest) {
  const [usageCount, setUsageCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const user = auth.currentUser;
  const email = user?.email || "guest";
  const today = new Date().toISOString().split("T")[0];

  // ✅ Correct key construction
  const usageKey = `${baseKey}_${email}`;
  const lastUsedKey = `${usageKey}LastUsed`;

  useEffect(() => {
    const initialize = async () => {
      const storedUsage = await AsyncStorage.getItem(usageKey);
      const lastUsed = await AsyncStorage.getItem(lastUsedKey);

      if (lastUsed !== today) {
        await AsyncStorage.setItem(usageKey, "0");
        await AsyncStorage.setItem(lastUsedKey, today);
        setUsageCount(0);
      } else {
        setUsageCount(storedUsage ? parseInt(storedUsage, 10) : 0);
      }

      setIsLoggedIn(email !== "guest");
    };

    const unsubscribe = auth.onAuthStateChanged(newUser => {
      const newEmail = newUser?.email || "guest";
      if (newEmail !== email) {
        initialize(); // re-run when email changes
      }
      setIsLoggedIn(!!newUser);
    });

    initialize();

    return () => unsubscribe();
  }, [usageKey, lastUsedKey, email]);

  const incrementUsage = async () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    await AsyncStorage.setItem(usageKey, newCount.toString());
    await AsyncStorage.setItem(lastUsedKey, today);
  };

  const limit = isLoggedIn ? limitLoggedIn : limitGuest;

  return { usageCount, limit, incrementUsage, isLoggedIn };
}
