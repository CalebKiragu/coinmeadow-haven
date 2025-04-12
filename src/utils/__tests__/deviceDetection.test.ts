
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isMobile, hasCamera, getPreferredCameraFacingMode } from '../deviceDetection';

describe('Device Detection Utilities', () => {
  beforeEach(() => {
    // Mock window and navigator
    vi.stubGlobal('navigator', {
      userAgent: '',
      mediaDevices: {
        enumerateDevices: vi.fn()
      }
    });
    
    vi.stubGlobal('window', {
      innerWidth: 1024,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isMobile function', () => {
    it('detects mobile device by user agent', () => {
      // Mock mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)',
        configurable: true
      });
      
      expect(isMobile()).toBe(true);
    });

    it('detects mobile device by screen width', () => {
      // Mock desktop user agent but mobile screen size
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
      });
      
      Object.defineProperty(window, 'innerWidth', {
        value: 480,
        configurable: true
      });
      
      expect(isMobile()).toBe(true);
    });

    it('detects desktop device', () => {
      // Mock desktop user agent and screen size
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
      });
      
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        configurable: true
      });
      
      expect(isMobile()).toBe(false);
    });
  });

  describe('hasCamera function', () => {
    it('returns true when camera is available', async () => {
      // Mock camera detection
      navigator.mediaDevices.enumerateDevices = vi.fn().mockResolvedValue([
        { kind: 'videoinput', deviceId: 'camera1' },
        { kind: 'audioinput', deviceId: 'mic1' }
      ]);
      
      const result = await hasCamera();
      expect(result).toBe(true);
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalled();
    });

    it('returns false when no camera is available', async () => {
      // Mock no camera
      navigator.mediaDevices.enumerateDevices = vi.fn().mockResolvedValue([
        { kind: 'audioinput', deviceId: 'mic1' }
      ]);
      
      const result = await hasCamera();
      expect(result).toBe(false);
    });

    it('returns false when mediaDevices is not supported', async () => {
      // Mock mediaDevices not available
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      });
      
      const result = await hasCamera();
      expect(result).toBe(false);
    });

    it('handles errors gracefully', async () => {
      // Mock error during detection
      navigator.mediaDevices.enumerateDevices = vi.fn().mockRejectedValue(new Error('Permission denied'));
      
      const result = await hasCamera();
      expect(result).toBe(false);
    });
  });

  describe('getPreferredCameraFacingMode function', () => {
    it('returns "environment" for mobile devices', () => {
      // Mock mobile device
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)',
        configurable: true
      });
      
      expect(getPreferredCameraFacingMode()).toBe('environment');
    });

    it('returns "user" for desktop devices', () => {
      // Mock desktop device
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        configurable: true
      });
      
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        configurable: true
      });
      
      expect(getPreferredCameraFacingMode()).toBe('user');
    });
  });
});
