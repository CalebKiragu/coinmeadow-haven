
/**
 * Basic utility for detecting mobile devices
 * @returns boolean indicating if the current device is a mobile device
 */
export const isMobile = (): boolean => {
  // Check if window is available (for SSR compatibility)
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Use either navigator.userAgentData (modern approach) or userAgent (fallback)
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Can also use screen width as an additional check
  const isSmallScreen = window.innerWidth <= 768;
  
  // Using our hook from useIsMobile as a fallback reference
  return isMobileDevice || isSmallScreen;
};

/**
 * Checks if the device has a camera
 * @returns Promise<boolean> resolving to true if device has a camera
 */
export const hasCamera = async (): Promise<boolean> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return false;
  }
  
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Error checking for camera:', error);
    return false;
  }
};

/**
 * Gets the preferred camera facing mode based on device type
 * @returns string representing the camera facing mode ('user' or 'environment')
 */
export const getPreferredCameraFacingMode = (): string => {
  return isMobile() ? 'environment' : 'user';
};
