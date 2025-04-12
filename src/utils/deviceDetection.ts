
/**
 * Device detection utilities
 * Helps determine the type of device being used to access the application
 */

/**
 * Checks if the current device is a mobile phone
 * @returns boolean indicating if the device is a mobile phone
 */
export const isMobile = (): boolean => {
  // Check if navigator exists (for SSR compatibility)
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  
  // Regular expression for mobile devices
  const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Check if it's mobile but not tablet
  return mobileRegex.test(userAgent) && !isTablet();
};

/**
 * Checks if the current device is a tablet
 * @returns boolean indicating if the device is a tablet
 */
export const isTablet = (): boolean => {
  // Check if navigator exists (for SSR compatibility)
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  
  // iPad specific check
  const isIPad = /iPad/i.test(userAgent) || 
                 (/Macintosh/i.test(userAgent) && 'ontouchend' in document);
  
  // Android tablet check
  const isAndroidTablet = /Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
  
  return isIPad || isAndroidTablet;
};

/**
 * Checks if the current device is a desktop computer
 * @returns boolean indicating if the device is a desktop
 */
export const isDesktop = (): boolean => {
  return !isMobile() && !isTablet();
};

/**
 * Gets the preferred camera facing mode based on device type
 * @returns 'environment' for mobile (rear camera) or 'user' for desktop (front camera)
 */
export const getPreferredCameraFacingMode = (): 'environment' | 'user' => {
  return isMobile() ? 'environment' : 'user';
};
