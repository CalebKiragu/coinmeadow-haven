
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import ResendOTP from '../ResendOTP';

describe('ResendOTP Component', () => {
  beforeEach(() => {
    // Reset timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with countdown initially', () => {
    const onResend = vi.fn();
    render(<ResendOTP onResend={onResend} cooldownPeriod={60} />);
    
    expect(screen.getByText(/Resend OTP \(60s\)/)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables button after countdown completes', async () => {
    const onResend = vi.fn();
    render(<ResendOTP onResend={onResend} cooldownPeriod={3} />);
    
    // Button should be disabled initially
    expect(screen.getByRole('button')).toBeDisabled();
    
    // Advance timer to complete countdown
    vi.advanceTimersByTime(3000);
    
    // Button should be enabled
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByText(/Resend OTP/)).toBeInTheDocument();
      expect(screen.queryByText(/\(\d+s\)/)).not.toBeInTheDocument();
    });
  });

  it('calls onResend callback when clicked', async () => {
    const onResend = vi.fn();
    render(<ResendOTP onResend={onResend} cooldownPeriod={3} />);
    
    // Advance timer to complete countdown
    vi.advanceTimersByTime(3000);
    
    // Button should be enabled
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
    
    // Click the button
    await userEvent.click(screen.getByRole('button'));
    
    // Callback should be called
    expect(onResend).toHaveBeenCalledTimes(1);
    
    // Button should be disabled again and countdown restarted
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/Resend OTP \(\d+s\)/)).toBeInTheDocument();
  });
});
