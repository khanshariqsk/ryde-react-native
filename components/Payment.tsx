import { View, Text, Alert, Image } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "./CustomButton";
import {
  handleNextAction,
  PaymentSheetError,
  useStripe
} from "@stripe/stripe-react-native";
import { fetchAPI } from "@/libs/fetch";
import { PaymentProps } from "@/types/type";
import { useLocationStore } from "@/store";
import { useAuth } from "@clerk/clerk-expo";
import { Result } from "@stripe/stripe-react-native/lib/typescript/src/types/Token";
import {
  IntentConfiguration,
  IntentCreationCallbackParams
} from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentSheet";
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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
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

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Ryde Inc.",
      intentConfiguration: {
        mode: {
          amount: 2000,
          currencyCode: "usd"
        },
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          intentCreationCallback
        ) => {
          const { paymentIntent, customer } = await fetchAPI(
            "/(api)/(stripe)/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email: email,
                amount: amount,
                paymentMethodId: paymentMethod.id
              })
            }
          );

          //   if (paymentIntent.client_secret) {
          //     // const { result, success, nextAction } = await fetchAPI(
          //     //   "/(api)/(stripe)/pay",
          //     //   {
          //     //     method: "POST",
          //     //     headers: {
          //     //       "Content-Type": "application/json"
          //     //     },
          //     //     body: JSON.stringify({
          //     //       payment_method_id: paymentMethod.id,
          //     //       payment_intent_id: paymentIntent.id,
          //     //       customer_id: customer,
          //     //       client_secret: paymentIntent.client_secret
          //     //     })
          //     //   }
          //     // );
          //     // console.log({ result, success, nextAction });
          //     // const actionResult = await handleNextAction(
          //     //   paymentIntent.client_secret
          //     // );
          //     // if (actionResult?.error) {
          //     //   console.log("error", actionResult.error.message);
          //     //   Alert.alert("Authentication Failed", actionResult.error.message);
          //     //   throw actionResult.error;
          //     // }
          //     // if (result.client_secret) {
          //     //   await fetchAPI("/(api)/ride/create", {
          //     //     method: "POST",
          //     //     headers: {
          //     //       "Content-Type": "application/json"
          //     //     },
          //     //     body: JSON.stringify({
          //     //       origin_address: userAddress,
          //     //       destination_address: destinationAddress,
          //     //       origin_latitude: userLatitude,
          //     //       origin_longitude: userLongitude,
          //     //       destination_latitude: destinationLatitude,
          //     //       destination_longitude: destinationLongitude,
          //     //       ride_time: rideTime.toFixed(0),
          //     //       fare_price: parseInt(amount) * 100,
          //     //       payment_status: "paid",
          //     //       driver_id: driverId,
          //     //       user_id: userId
          //     //     })
          //     //   });
          //     //   console.log({
          //     //     "result.client_secret": result.client_secret,
          //     //     "paymentIntent.client_secret": paymentIntent.client_secret,
          //     //     "paymentMethod.id": paymentMethod.id
          //     //   });
          //     //   intentCreationCallback({
          //     //     clientSecret: result.client_secret
          //     //   });
          //     // }
          //   } else {
          //   }

          if (paymentIntent.client_secret) {
            console.log({
              clientSecret: paymentIntent.client_secret
            });
            intentCreationCallback({
              clientSecret: paymentIntent.client_secret
            });
          }
        }
      },
      appearance: {
        // colors: {
        //   primary: "#0286FF",
        //   background: "#FFFFFF",
        //   componentBackground: "#EAF7FF",
        //   componentBorder: "#D1E7FF",
        //   componentDivider: "#E0E0E0",
        //   primaryText: "#000000", // Main text (general text on components)
        //   secondaryText: "#7D7D7D", // Secondary text
        //   placeholderText: "#A1A1A1", // Placeholder text for inputs
        //   icon: "#000000", // Icons color
        //   error: "#FF3B30" // Error messages
        // },
        shapes: {
          borderRadius: 12 // Rounded corners for buttons and cards
        }
      },
      returnURL: "myapp://book-ride"
    });
  };

  const openPaymentSheet = async () => {
    await initializePaymentSheet();
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-20"
        onPress={openPaymentSheet}
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
