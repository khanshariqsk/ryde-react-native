import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  Touchable,
  TouchableOpacity
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { fetchAPI, useFetch } from "@/libs/fetch";
import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import { useLocationStore } from "@/store";
import * as Location from "expo-location";
import { router } from "expo-router";

const Home = () => {
  const { setDestinationLocation, setUserLocation } = useLocationStore();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);

  const {
    data: recentRides,
    error,
    loading
  } = useFetch(`/(api)/ride/${user?.id}`);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      if (user?.id) {
        try {
          const response = await fetchAPI(`/(api)/user?clerkId=${user?.id}`, {
            method: "GET"
          });

          if (isMounted) {
            setUserName(response.user?.name || "");
          }
        } catch (error) {
          if (isMounted) {
            console.error("Error fetching user:", error);
          }
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setHasPermissions(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`
      });
    };
    requestLocation();
  }, []);

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  
  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  };
  return (
    <SafeAreaView>
      <FlatList
        data={recentRides}
        renderItem={({ item }) => <RideCard ride={item} />}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-md font-semibold">
                  No recent rides found
                </Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-2xl font-JakartaExtraBold">
                Welcome{", "}
                {user?.firstName ||
                  userName ||
                  user?.emailAddresses[0]?.emailAddress?.split("@")[0]}{" "}
                👋
              </Text>

              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image source={icons.out} className="w-5 h-5" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />

            <>
              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Your Current Location
              </Text>
              <View className="flex flex-row items-center bg-transparent h-[300px] w-full">
                <Map />
              </View>
            </>

            <Text className="text-xl font-JakartaBold mt-5 mb-3">
              Recent Rides
            </Text>
          </>
        )}
      />
    </SafeAreaView>
  );
};

export default Home;
