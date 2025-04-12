
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  isMobile, 
  isTablet, 
  isDesktop, 
  getPreferredCameraFacingMode 
} from '../deviceDetection';

describe('Device Detection Utilities', () => {
  const originalNavigator = global.navigator;
  
  beforeEach(() => {
    // Create a mock navigator object
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: '',
      },
      writable: true,
      configurable: true,
    });
  });
  
  afterEach(() => {
    // Restore the original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });
  
  it('detects mobile devices correctly', () => {
    // Android mobile
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36',
      configurable: true
    });
    expect(isMobile()).toBe(true);
    
    // iPhone
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1',
      configurable: true
    });
    expect(isMobile()).toBe(true);
    
    // Desktop
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
      configurable: true
    });
    expect(isMobile()).toBe(false);
  });
  
  it('detects tablet devices correctly', () => {
    // iPad
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPad; CPU OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      configurable: true
    });
    expect(isTablet()).toBe(true);
    
    // Android tablet
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 10; SM-T510) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Safari/537.36',
      configurable: true
    });
    expect(isTablet()).toBe(true);
    
    // Desktop
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
      configurable: true
    });
    expect(isTablet()).toBe(false);
  });
  
  it('detects desktop devices correctly', () => {
    // Desktop
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
      configurable: true
    });
    expect(isDesktop()).toBe(true);
    
    // Mobile
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1',
      configurable: true
    });
    expect(isDesktop()).toBe(false);
  });
  
  it('returns the correct camera facing mode based on device type', () => {
    // Mobile: should use back camera
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1',
      configurable: true
    });
    expect(getPreferredCameraFacingMode()).toBe('environment');
    
    // Desktop: should use front camera
    Object.defineProperty(global.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
      configurable: true
    });
    expect(getPreferredCameraFacingMode()).toBe('user');
  });
});
