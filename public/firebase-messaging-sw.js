// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker
// REPLACE THESE with the exact values from your .env.local!
firebase.initializeApp({
  apiKey: "AIzaSyCaCUV4rLtfklDshqgfNnEPNxL9kw4q4Gs",
  authDomain: "lost-and-found-app-b0f13.firebaseapp.com",
  projectId: "lost-and-found-app-b0f13",
  storageBucket: "lost-and-found-app-b0f13.firebasestorage.app",
  messagingSenderId: "1032253027734",
  appId: "1:1032253027734:web:e39261973ce5f5bc86d9b7"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);
  
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/favicon.ico", // Replace with your app logo path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
