import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import { AuthProvider, useAuth } from "./src/context/AuthContext";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import StudyWordScreen from "./src/screens/StudyWordScreen";
import QuizSetupScreen from "./src/screens/QuizSetupScreen";
import QuizScreen from "./src/screens/QuizScreen";
import QuizResultScreen from "./src/screens/QuizResultScreen";
import WordListsScreen from "./src/screens/WordListsScreen";
import WordListDetailScreen from "./src/screens/WordListDetailScreen";
import ParagraphCreateScreen from "./src/screens/ParagraphCreateScreen";
import UploadResourceScreen from "./src/screens/UploadResourceScreen";
import ReadingModeScreen from "./src/screens/ReadingModeScreen";
import ReaderScreen from "./src/screens/ReaderScreen";

const Stack = createNativeStackNavigator();

// Auth Stack - Giriş yapmamış kullanıcılar için
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: "slide_from_right",
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Main Stack - Giriş yapmış kullanıcılar için
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: "slide_from_right",
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="StudyWord" component={StudyWordScreen} />
    <Stack.Screen name="QuizSetup" component={QuizSetupScreen} />
    <Stack.Screen name="Quiz" component={QuizScreen} />
    <Stack.Screen name="QuizResult" component={QuizResultScreen} />
    <Stack.Screen name="WordLists" component={WordListsScreen} />
    <Stack.Screen name="WordListDetail" component={WordListDetailScreen} />
    <Stack.Screen name="ParagraphCreate" component={ParagraphCreateScreen} />
    <Stack.Screen name="UploadResource" component={UploadResourceScreen} />
    <Stack.Screen name="ReadingMode" component={ReadingModeScreen} />
    <Stack.Screen name="Reader" component={ReaderScreen} />
  </Stack.Navigator>
);

// Root Navigator - Auth durumuna göre yönlendirme
const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ECC71" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
