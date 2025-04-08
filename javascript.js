// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyD7ZSv5M66lf_nOIN_HSndf0vn-tRW-AIg",
    authDomain: "entypt-website.firebaseapp.com",
    projectId: "entypt-website",
    storageBucket: "entypt-website.firebasestorage.app",
    messagingSenderId: "106688072056",
    appId: "1:106688072056:web:79d32f2eb4c6470903e08d"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to send message to Firestore
export async function sendMessageToFirebase(email, message) {
  try {
    await addDoc(collection(db, "messages"), {
      email: email,
      message: message,
      timestamp: serverTimestamp()
    });
    alert("Message sent successfully!");
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send message.");
  }
}

// Function to collect device information
function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    screenColorDepth: window.screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    deviceMemory: navigator.deviceMemory || 'Not available',
    hardwareConcurrency: navigator.hardwareConcurrency || 'Not available',
    connection: navigator.connection ? 
      {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : 'Not available',
    referrer: document.referrer || 'Direct',
    browserName: getBrowserName(),
    osName: getOSName()
  };
}

// Helper function to detect browser name
function getBrowserName() {
  const userAgent = navigator.userAgent;
  let browserName;
  
  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "Chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "Firefox";
  } else if (userAgent.match(/safari/i)) {
    browserName = "Safari";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "Opera";
  } else if (userAgent.match(/edg/i)) {
    browserName = "Edge";
  } else if (userAgent.match(/trident/i)) {
    browserName = "Internet Explorer";
  } else {
    browserName = "Unknown Browser";
  }
  
  return browserName;
}

// Helper function to detect OS name
function getOSName() {
  const userAgent = navigator.userAgent;
  let osName;
  
  if (userAgent.indexOf("Windows NT 10.0") !== -1) osName = "Windows 10";
  else if (userAgent.indexOf("Windows NT 6.3") !== -1) osName = "Windows 8.1";
  else if (userAgent.indexOf("Windows NT 6.2") !== -1) osName = "Windows 8";
  else if (userAgent.indexOf("Windows NT 6.1") !== -1) osName = "Windows 7";
  else if (userAgent.indexOf("Windows NT 6.0") !== -1) osName = "Windows Vista";
  else if (userAgent.indexOf("Windows NT 5.1") !== -1) osName = "Windows XP";
  else if (userAgent.indexOf("Windows NT 5.0") !== -1) osName = "Windows 2000";
  else if (userAgent.indexOf("Mac") !== -1) osName = "MacOS";
  else if (userAgent.indexOf("X11") !== -1) osName = "UNIX";
  else if (userAgent.indexOf("Linux") !== -1) osName = "Linux";
  else if (userAgent.indexOf("Android") !== -1) osName = "Android";
  else if (userAgent.indexOf("iPhone") !== -1 || userAgent.indexOf("iPad") !== -1) osName = "iOS";
  else osName = "Unknown OS";
  
  return osName;
}

// Function to get IP address and location data
async function getIPAndLocationInfo() {
  try {
    // Using ipify API to get IP and location data - use HTTPS
    const response = await fetch('https://api.ipify.org?format=json');
    const ipData = await response.json();
    
    try {
      // Use HTTPS for geo API to avoid mixed content issues
      const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
      const geoData = await geoResponse.json();
      
      return {
        ip: ipData.ip,
        location: {
          country: geoData.country_name || 'Unknown',
          region: geoData.region || 'Unknown',
          city: geoData.city || 'Unknown',
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          timezone: geoData.timezone || 'Unknown'
        }
      };
    } catch (geoError) {
      console.error("Error fetching geo data:", geoError);
      // Return IP only if geo data fails
      return { ip: ipData.ip, location: 'Location data unavailable' };
    }
  } catch (error) {
    console.error("Error fetching IP data:", error);
    return { ip: 'Could not determine', location: 'Could not determine' };
  }
}

// Function to log visitor info to Firebase
async function logVisitorInfo() {
  try {
    const deviceInfo = getDeviceInfo();
    const ipInfo = await getIPAndLocationInfo();
    
    // Combine all information
    const visitorData = {
      timestamp: serverTimestamp(),
      device: deviceInfo,
      ipAddress: ipInfo.ip,
      location: ipInfo.location,
      page: window.location.href,
      visitType: "Page Visit"
    };
    
    // Store in Firebase - this line saves to the "visitors" collection
    await addDoc(collection(db, "visitors"), visitorData);
  } catch (error) {
  }
}

// Log information when the page loads
window.addEventListener('load', function() {
  try {
    // Set a delay to ensure all relevant information is available
    setTimeout(() => {
      logVisitorInfo();
    }, 1000);
  } catch (error) {
    // Don't let logging errors affect page functionality
  }
});

// Export the log function for potential direct calling
export { logVisitorInfo };