import { View, Text, Image, ScrollView, Alert } from "react-native";
import React, { useCallback, useState } from "react";
import { icons, images } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import OAuth from "@/components/OAuth";
import { Link, useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [signInLoading, setsignInLoading] = useState<boolean>(false);

  // Handle the submission of the sign-in form
  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    setsignInLoading(true);

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      Alert.alert("Error", err?.errors?.[0]?.longMessage);
    } finally {
      setsignInLoading(false);
    }
  }, [isLoaded, form.email, form.password, router, setActive, signIn]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome 👋
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => {
              setForm({
                ...form,
                email: value,
              });
            }}
          />
          <InputField
            label="Password"
            placeholder="Enter your password"
            icon={icons.lock}
            value={form.password}
            onChangeText={(value) => {
              setForm({
                ...form,
                password: value,
              });
            }}
            secureTextEntry
          />

          <CustomButton
            onPress={onSignInPress}
            className="mt-8"
            title={signInLoading ? "Signing in..." : "Sign In"}
            disabled={signInLoading}
            bgVariant={signInLoading ? "secondary" : "primary"}
          />

          <OAuth />

          <Link
            href={"/(auth)/sign-up"}
            className="text-lg text-center text-general-200 mt-10"
          >
            <Text>Don't have an account? </Text>
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
