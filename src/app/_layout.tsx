import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "../context/UserContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { PropsWithChildren, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function AuthGuard({ children }: PropsWithChildren) {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if(isLoading) return;
    
    const inTabGroup = segments[0] === "(tabs)";
    const inPublicAuthScreen = segments[0] === "logIn" || segments[0] === "signUp";

    if(!session && inTabGroup) router.replace("/logIn");
    else if(session && inPublicAuthScreen) router.replace("/(tabs)/index");
  }, [session, isLoading, segments, router]);

  if(isLoading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#2727bf" />
    </View>
  );

  return<>{children}</>;

}

export const unstable_settings = {
  anchor: "welcome",
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGuard>
          <UserProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          </UserProvider>
        </AuthGuard>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dacfcf",
  },
});
