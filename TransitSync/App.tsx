import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { requestStoragePermission } from "./src/utils/permissions";

function App() {
  useEffect(() => {
    requestStoragePermission();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F17" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
