import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import useDailyUsage from "./useDailyUsage";

export default function useUsageGuard(storageKey, limitLoggedIn = 3, limitGuest = 1) {
  const navigation = useNavigation();
  const route = useRoute();

  const {
    usageCount,
    incrementUsage,
    isLoggedIn,
    limit,
  } = useDailyUsage(storageKey, limitLoggedIn, limitGuest);

  const checkUsage = () => {
    if (!isLoggedIn && usageCount >= limitGuest) {
      Alert.alert(
        "Login Required",
        "Log in to use this feature again today.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Login",
            onPress: () => navigation.navigate("Login", { redirectTo: route.name }),
          },
        ]
      );
      return false;
    }

    if (isLoggedIn && usageCount >= limitLoggedIn) {
      Alert.alert("Limit Reached", "You’ve used your daily limit. Please come back tomorrow.");
      return false;
    }

    return true;
  };

  return {
    usageCount,
    incrementUsage,
    isLoggedIn,
    limit,
    checkUsage,
  };
}
