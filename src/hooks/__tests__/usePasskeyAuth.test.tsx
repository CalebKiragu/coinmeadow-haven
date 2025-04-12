
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePasskeyAuth } from '../usePasskeyAuth';

// Mock the use-toast hook
vi.mock('../use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('usePasskeyAuth Hook', () => {
  beforeEach(() => {
    // Reset timers
    vi.useFakeTimers();
    
    // Mock window and navigator for passkey functionality
    vi.stubGlobal('window', {
      PublicKeyCredential: {},
      confirm: vi.fn().mockReturnValue(true),
    });
    
    vi.stubGlobal('navigator', {
      credentials: {
        get: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => usePasskeyAuth());
    
    expect(result.current.isPasskeyVerified).toBe(true);
    expect(result.current.isVerifying).toBe(false);
    expect(typeof result.current.verifyPasskey).toBe('function');
  });

  it('marks passkey as expired after 3 minutes', async () => {
    const { result } = renderHook(() => usePasskeyAuth());
    
    // Initially verified
    expect(result.current.isPasskeyVerified).toBe(true);
    
    // Verify to set lastVerifiedTime
    await act(async () => {
      await result.current.verifyPasskey();
    });
    
    // Advance time by 3+ minutes
    act(() => {
      vi.advanceTimersByTime(3 * 60 * 1000 + 100);
    });
    
    // Should now be expired
    expect(result.current.isPasskeyVerified).toBe(false);
  });

  it('successfully verifies passkey', async () => {
    const { result } = renderHook(() => usePasskeyAuth());
    
    let verifyResult: boolean | undefined;
    
    await act(async () => {
      // Simulate verification process
      verifyResult = await result.current.verifyPasskey();
      
      // Fast-forward past the timeout
      vi.advanceTimersByTime(1100);
    });
    
    expect(verifyResult).toBe(true);
    expect(result.current.isPasskeyVerified).toBe(true);
    expect(result.current.isVerifying).toBe(false);
  });

  it('handles browsers without WebAuthn support', async () => {
    // Mock window without PublicKeyCredential
    vi.unstubAllGlobals();
    vi.stubGlobal('window', {
      confirm: vi.fn().mockReturnValue(true),
    });
    
    const { result } = renderHook(() => usePasskeyAuth());
    
    let verifyResult: boolean | undefined;
    
    await act(async () => {
      // Simulate verification process
      verifyResult = await result.current.verifyPasskey();
      
      // Fast-forward past the timeout
      vi.advanceTimersByTime(1100);
    });
    
    expect(window.confirm).toHaveBeenCalled();
    expect(verifyResult).toBe(true);
    expect(result.current.isPasskeyVerified).toBe(true);
  });

  it('handles user cancellation', async () => {
    // Mock window.confirm returning false (user cancels)
    vi.unstubAllGlobals();
    vi.stubGlobal('window', {
      confirm: vi.fn().mockReturnValue(false),
    });
    
    const { result } = renderHook(() => usePasskeyAuth());
    
    await act(async () => {
      try {
        await result.current.verifyPasskey();
      } catch (error) {
        // Expected to throw
        expect(error).toBeDefined();
      }
    });
    
    expect(window.confirm).toHaveBeenCalled();
    expect(result.current.isVerifying).toBe(false);
  });
});
