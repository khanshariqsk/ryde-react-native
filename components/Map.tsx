import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useLocationStore } from "@/store";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData
} from "@/libs/map";
import { Driver, MarkerData } from "@/types/type";
import { useDriverStore } from "../store/index";
import { icons } from "@/constants";
import { useFetch } from "@/libs/fetch";
import MapViewDirections from "react-native-maps-directions";

const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const Map = () => {
  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const { selectedDriver, setDrivers } = useDriverStore();

  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude
  } = useLocationStore();

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude
  });

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude
      });
      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (markers.length > 0 && destinationLatitude && destinationLongitude) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  if (loading || (!userLatitude && !userLongitude))
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ flex: 1, width: "100%", height: "100%", borderRadius: 16 }}
      tintColor="black"
      mapType="standard"
      showsPointsOfInterest={false}
      showsUserLocation={true}
      userInterfaceStyle="light"
      initialRegion={region}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude
          }}
          title={marker.title}
          image={
            selectedDriver == marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}

      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLatitude
            }}
            image={icons.pin}
            title="Destination"
          />

          <MapViewDirections
            origin={{
              latitude: userLatitude!,
              longitude: userLongitude!
            }}
            destination={{
              latitude: destinationLatitude,
              longitude: destinationLongitude
            }}
            apikey={directionsAPI!}
            strokeColor="#0286FF"
            strokeWidth={6}
          />
        </>
      )}
    </MapView>
  );
};

export default Map;
