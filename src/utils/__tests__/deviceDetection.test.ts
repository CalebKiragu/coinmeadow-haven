
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  isMobile, 
  isTablet, 
  isDesktop, 
  getPreferredCameraFacingMode 
} from '../deviceDetection';

describe('Device Detection Utilities', () => {
  const originalNavigator = global.navigator;
  let userAgentGetter: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    // Create a mock for navigator.userAgent getter
    userAgentGetter = vi.spyOn(window.navigator, 'userAgent', 'get');
  });
  
  afterEach(() => {
    // Restore the original navigator
    vi.restoreAllMocks();
  });
  
  it('detects mobile devices correctly', () => {
    // Android mobile
    userAgentGetter.mockReturnValue('Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36');
    expect(isMobile()).toBe(true);
    
    // iPhone
    userAgentGetter.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1');
    expect(isMobile()).toBe(true);
    
    // Desktop
    userAgentGetter.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
    expect(isMobile()).toBe(false);
  });
  
  it('detects tablet devices correctly', () => {
    // iPad
    userAgentGetter.mockReturnValue('Mozilla/5.0 (iPad; CPU OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
    expect(isTablet()).toBe(true);
    
    // Android tablet
    userAgentGetter.mockReturnValue('Mozilla/5.0 (Linux; Android 10; SM-T510) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Safari/537.36');
    expect(isTablet()).toBe(true);
    
    // Desktop
    userAgentGetter.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
    expect(isTablet()).toBe(false);
  });
  
  it('detects desktop devices correctly', () => {
    // Desktop
    userAgentGetter.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
    expect(isDesktop()).toBe(true);
    
    // Mobile
    userAgentGetter.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1');
    expect(isDesktop()).toBe(false);
  });
  
  it('returns the correct camera facing mode based on device type', () => {
    // Mobile: should use back camera
    userAgentGetter.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1');
    expect(getPreferredCameraFacingMode()).toBe('environment');
    
    // Desktop: should use front camera
    userAgentGetter.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');
    expect(getPreferredCameraFacingMode()).toBe('user');
  });
});
