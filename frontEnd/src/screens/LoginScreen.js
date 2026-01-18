import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Hata", "Lütfen email adresinizi girin");
      return;
    }
    
    if (!password) {
      Alert.alert("Hata", "Lütfen şifrenizi girin");
      return;
    }

    setIsLoading(true);
    
    const result = await login(email.trim(), password);
    
    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Giriş Başarısız", result.error);
    }
    // Başarılı olursa AuthContext otomatik olarak yönlendirecek
  };

  const handleSignUp = () => {
    navigation.navigate("Register");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuC04F0A53dsTqiVk43sof3wApfXAOu9lMpC8wONpleDQVe3IVsHRhfzFKhO1uLXI30lwseemeuBXeJMHZmkhoT7YgWAc9SEUR5HJut-Vhn-B--ET-yRROsDMlU09nOoNwFhAs1BTtby8klrcxeyZFlO7vu349O3EraRGK6LdDWsQkdGridSozpmogcU97CxnGTj89NSio7kKg_pvDUWqb1i_eVXBNguKk-LW4rLwb4qFAXWAFLxNDVGBoupjfTmVdtp31SmnBeeTYJL",
              }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.loginText}>Login</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={22}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: "#1F2937",
    lineHeight: 40,
  },
  loginText: {
    fontSize: 32,
    fontFamily: "Poppins_700Bold",
    color: "#1F2937",
    lineHeight: 40,
  },
  formContainer: {
    width: "100%",
    maxWidth: 380,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
    position: "relative",
  },
  input: {
    width: "100%",
    height: 56,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 28,
    paddingHorizontal: 24,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#374151",
    backgroundColor: "transparent",
  },
  passwordInput: {
    paddingRight: 56,
  },
  eyeButton: {
    position: "absolute",
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#4ADE80",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#4ADE80",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#6B7280",
  },
  signUpText: {
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
    color: "#2C5282",
  },
});

export default LoginScreen;
