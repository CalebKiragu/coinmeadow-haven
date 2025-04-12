
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import OTPInput from '../OTPInput';

describe('OTPInput Component', () => {
  it('renders correctly with identifier', () => {
    const handleChange = vi.fn();
    render(<OTPInput value="" onChange={handleChange} identifier="test@example.com" />);
    
    expect(screen.getByText(/Enter the 4-digit code sent to test@example.com/)).toBeInTheDocument();
    // Check for OTP input slots
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders with default text when identifier is not provided', () => {
    const handleChange = vi.fn();
    render(<OTPInput value="" onChange={handleChange} />);
    
    expect(screen.getByText(/Enter the 4-digit code sent to your contact/)).toBeInTheDocument();
  });

  // Note: Testing actual input in OTP fields is challenging with testing-library
  // due to the custom InputOTP component used. This would require more complex testing
  // that mocks the internal behavior.
});
