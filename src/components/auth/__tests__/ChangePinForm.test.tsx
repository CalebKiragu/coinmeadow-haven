
import { describe, it, expect, vi, beforeEach } from '../../../test/test-imports';
import { render, screen, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import ChangePinForm from '../ChangePinForm';
import { ApiService } from '@/lib/services';

// Mock the API service
vi.mock('@/lib/services', () => ({
  ApiService: {
    resetUserPin: vi.fn(),
    resetMerchantPin: vi.fn(),
    changeUserPin: vi.fn(),
    changeMerchantPin: vi.fn(),
  },
}));

// Mock the use-toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('ChangePinForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reset PIN form correctly', () => {
    render(<ChangePinForm isReset onClose={() => {}} />);
    
    // Check for key elements in reset mode
    expect(screen.getByText('Reset PIN Verification')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email or phone')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('renders change PIN form correctly', () => {
    render(<ChangePinForm onClose={() => {}} />);
    
    // Check for key elements in change mode
    expect(screen.getByText('Change PIN Verification')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email or phone')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('progresses through reset PIN flow for users', async () => {
    const mockResetUserPin = ApiService.resetUserPin as vi.Mock;
    mockResetUserPin.mockResolvedValue({ otpId: '123' });
    
    const mockOnClose = vi.fn();
    render(<ChangePinForm isReset onClose={mockOnClose} />);
    
    // Step 1: Enter email
    await userEvent.type(screen.getByPlaceholderText('Enter your email or phone'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    
    // Check API call
    expect(mockResetUserPin).toHaveBeenCalledWith({ email: 'test@example.com' });
    
    // Step 2: Verify OTP
    await waitFor(() => {
      expect(screen.getByText('Verify OTP')).toBeInTheDocument();
    });
    
    // Step 3: Set new PIN
    mockResetUserPin.mockResolvedValue({ success: true });
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    
    await waitFor(() => {
      expect(screen.getByText('Set New PIN')).toBeInTheDocument();
    });
    
    // Enter new PIN
    await userEvent.type(screen.getByPlaceholderText('New PIN'), '1234');
    await userEvent.type(screen.getByPlaceholderText('Confirm New PIN'), '1234');
    
    // Submit new PIN
    mockResetUserPin.mockResolvedValue({ success: true });
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    
    // Final confirmation
    await waitFor(() => {
      expect(screen.getByText('PIN Reset Complete')).toBeInTheDocument();
    });
    
    // Confirm close callback is eventually called
    vi.advanceTimersByTime(2500);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles errors in PIN change flow', async () => {
    const mockChangeUserPin = ApiService.changeUserPin as vi.Mock;
    mockChangeUserPin.mockRejectedValueOnce(new Error('Invalid current PIN'));
    
    render(<ChangePinForm onClose={() => {}} />);
    
    // Step 1: Enter email
    await userEvent.type(screen.getByPlaceholderText('Enter your email or phone'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    
    // Step 3: Change PIN (skipping OTP for change flow)
    await waitFor(() => {
      expect(screen.getByText('Change PIN')).toBeInTheDocument();
    });
    
    // Enter PIN details
    await userEvent.type(screen.getByPlaceholderText('Current PIN'), '0000');
    await userEvent.type(screen.getByPlaceholderText('New PIN'), '1234');
    await userEvent.type(screen.getByPlaceholderText('Confirm New PIN'), '1234');
    
    // Submit with error
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    
    // Error handling should occur, form remains on the same step
    await waitFor(() => {
      expect(mockChangeUserPin).toHaveBeenCalled();
      expect(screen.getByText('Change PIN')).toBeInTheDocument();
    });
  });

  it('validates PIN matching in the form', async () => {
    render(<ChangePinForm onClose={() => {}} />);
    
    // Step 1: Enter email
    await userEvent.type(screen.getByPlaceholderText('Enter your email or phone'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    
    // Step 3: Change PIN screen
    await waitFor(() => {
      expect(screen.getByText('Change PIN')).toBeInTheDocument();
    });
    
    // Enter mismatching PINs
    await userEvent.type(screen.getByPlaceholderText('Current PIN'), '0000');
    await userEvent.type(screen.getByPlaceholderText('New PIN'), '1234');
    await userEvent.type(screen.getByPlaceholderText('Confirm New PIN'), '5678');
    
    // Try to submit
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    
    // Should show validation error and not proceed
    expect(ApiService.changeUserPin).not.toHaveBeenCalled();
  });
});
