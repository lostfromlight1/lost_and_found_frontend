"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { requestForToken } from "@/lib/firebase";
import { useSaveFcmToken } from "./useNotifications";

export const useFcmInit = () => {
  const { data: session } = useSession();
  const { mutate: saveToken } = useSaveFcmToken();
  const initialized = useRef(false);

  useEffect(() => {
    // Only request push notifications if the user is actively logged in
    if (!session || initialized.current) return;

    const initPushNotifications = async () => {
      try {
        // Request browser permission
        const permission = await Notification.requestPermission();
        
        if (permission === "granted") {
          // Get the FCM token from Firebase
          const token = await requestForToken();
          
          // Send it to the Spring Boot Backend
          if (token) {
            saveToken(token);
            initialized.current = true;
          }
        }
      } catch (error) {
        console.error("Failed to initialize push notifications:", error);
      }
    };

    initPushNotifications();
  }, [session, saveToken]);
};
