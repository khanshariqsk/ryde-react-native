import { View, Text, Alert, Image, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "./CustomButton";

import { fetchAPI } from "@/libs/fetch";
import { PaymentProps } from "@/types/type";
import { useLocationStore } from "@/store";
import { useAuth } from "@clerk/clerk-expo";

import { router } from "expo-router";
import ReactNativeModal from "react-native-modal";
import { images } from "@/constants";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime
}: PaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude
  } = useLocationStore();

  const { userId } = useAuth();

  const bookRide = async () => {
    try {
      setLoading(true);
      await fetchAPI("/(api)/ride/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          origin_address: userAddress,
          destination_address: destinationAddress,
          origin_latitude: userLatitude,
          origin_longitude: userLongitude,
          destination_latitude: destinationLatitude,
          destination_longitude: destinationLongitude,
          ride_time: rideTime.toFixed(0),
          fare_price: +amount * 100,
          payment_status: "paid",
          driver_id: driverId,
          user_id: userId
        })
      });
      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("ERROR", `Failed to book the ride: ${error.message}`);
      } else {
        Alert.alert("ERROR", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomButton
        title={loading ? "Confirming Ride.." : "Confirm Ride"}
        className={Platform.OS == "ios" ? "my-10" : "mt-6"}
        onPress={bookRide}
        bgVariant={loading ? "secondary" : "primary"}
        disabled={loading}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
