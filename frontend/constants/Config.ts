import { Platform } from 'react-native';

// REPLACE THIS with your computer's local IP (e.g., '192.168.1.10')
// You can find it by running 'ipconfig' in your terminal
const LOCAL_IP: string = '192.168.1.218';

const getBaseUrl = () => {
  // If we are on Android Emulator, and haven't set a custom IP, use 10.0.2.2
  if (Platform.OS === 'android' && LOCAL_IP === 'localhost') {
    return 'http://10.0.2.2:8000';
  }

  // Otherwise use the IP provided (works for iOS, Web, and Physical Android)
  return `http://${LOCAL_IP}:8000`;
};


export const API_URL = getBaseUrl();
