import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Platform
} from "react-native";
import React, { useRef } from "react";
import { router } from "expo-router";
import { icons } from "@/constants";
import Map from "./Map";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const RideLayout = ({
  children,
  title = "Go Back",
  snapPoints
}: {
  children: React.ReactNode;
  title: string;
  snapPoints?: string[];
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  return (
    <View className="flex-1 bg-white">
      <View className="flex flex-col h-screen bg-blue-500">
        <View
          className={`flex flex-row absolute z-10 ${Platform.OS === "ios" ? "top-16" : "top-4"} items-center justify-center px-5`}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
              <Image
                source={icons.backArrow}
                resizeMode="contain"
                className="h-6 w-6"
              />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-JakartaSemiBold ml-5">{title}</Text>
        </View>
        <Map />
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints || ["40%", "85%"]}
        index={1}
        keyboardBehavior="extend"
      >
        <BottomSheetView style={{ flex: 1, padding: 20 }}>
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={{ flex: 1 }}>{children}</View>
          </TouchableWithoutFeedback>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

export default RideLayout;
