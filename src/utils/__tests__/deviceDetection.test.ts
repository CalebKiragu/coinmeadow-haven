
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isMobile, isTablet, isDesktop } from '../deviceDetection';

describe('Device Detection Utilities', () => {
  let originalNavigator: any;

  beforeEach(() => {
    // Save original navigator
    originalNavigator = global.navigator;

    // Create a mutable navigator object for testing
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: {
        userAgent: '',
      },
    });
  });

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: originalNavigator,
    });
  });

  it('detects mobile devices correctly', () => {
    // Test iPhone
    global.navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
    expect(isMobile()).toBe(true);
    expect(isTablet()).toBe(false);
    expect(isDesktop()).toBe(false);

    // Test Android phone
    global.navigator.userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36';
    expect(isMobile()).toBe(true);
    expect(isTablet()).toBe(false);
    expect(isDesktop()).toBe(false);
  });

  it('detects tablet devices correctly', () => {
    // Test iPad
    global.navigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
    expect(isMobile()).toBe(false);
    expect(isTablet()).toBe(true);
    expect(isDesktop()).toBe(false);

    // Test Android tablet
    global.navigator.userAgent = 'Mozilla/5.0 (Linux; Android 10; SM-T510) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Safari/537.36';
    expect(isMobile()).toBe(false);
    expect(isTablet()).toBe(true);
    expect(isDesktop()).toBe(false);
  });

  it('detects desktop devices correctly', () => {
    // Test Windows desktop
    global.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36';
    expect(isMobile()).toBe(false);
    expect(isTablet()).toBe(false);
    expect(isDesktop()).toBe(true);

    // Test Mac desktop
    global.navigator.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15';
    expect(isMobile()).toBe(false);
    expect(isTablet()).toBe(false);
    expect(isDesktop()).toBe(true);
  });
});
