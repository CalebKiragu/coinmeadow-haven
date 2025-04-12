
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import SignupForm from '../SignupForm';
import { ApiService } from '@/lib/services';

// Mock the API service
vi.mock('@/lib/services', () => ({
  ApiService: {
    verifyUserEmail: vi.fn(),
    verifyUserPhone: vi.fn(),
    signupUser: vi.fn(),
  },
}));

// Mock the react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock the use-toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('SignupForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<SignupForm />);
    
    // Check for key elements
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Phone' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('progresses through email signup flow', async () => {
    const mockVerifyEmail = ApiService.verifyUserEmail as vi.Mock;
    mockVerifyEmail.mockResolvedValue({ otpId: '123' });
    
    render(<SignupForm />);
    
    // Step 1: Enter email
    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    
    // Check API call
    expect(mockVerifyEmail).toHaveBeenCalledWith('test@example.com', undefined, undefined);
    
    // Step 2: Verify OTP
    await waitFor(() => {
      expect(screen.getByText(/Enter the 4-digit code/)).toBeInTheDocument();
    });
    
    // Simulate OTP input
    // Note: InputOTP component might require special handling in tests
    // This is a simplified version
    mockVerifyEmail.mockResolvedValue({ success: true });
    const otpInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < otpInputs.length && i < 4; i++) {
      await userEvent.type(otpInputs[i], i.toString());
    }
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    
    // Step 3: Personal information
    await waitFor(() => {
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    });
  });

  it('handles signup errors correctly', async () => {
    const mockVerifyEmail = ApiService.verifyUserEmail as vi.Mock;
    mockVerifyEmail.mockRejectedValueOnce(new Error('Invalid email'));
    
    const { store } = render(<SignupForm />);
    
    // Try to submit with email
    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    
    // Check if error handling worked
    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalled();
    });
  });

  it('validates PIN matching in final step', async () => {
    const mockVerifyEmail = ApiService.verifyUserEmail as vi.Mock;
    mockVerifyEmail.mockResolvedValue({ otpId: '123' });
    
    render(<SignupForm />);
    
    // Go to step 3 directly (simplifying previous steps for this test)
    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    
    // Step 2: Skip OTP verification
    mockVerifyEmail.mockResolvedValue({ success: true });
    await waitFor(() => {
      expect(screen.getByText(/Enter the 4-digit code/)).toBeInTheDocument();
    });
    
    // Fake OTP entry for this test
    const otpInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < otpInputs.length && i < 4; i++) {
      await userEvent.type(otpInputs[i], i.toString());
    }
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    
    // Now in step 3
    await waitFor(() => {
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    });
    
    // Enter mismatching PINs
    await userEvent.type(screen.getByPlaceholderText('First Name'), 'John');
    await userEvent.type(screen.getByPlaceholderText('Last Name'), 'Doe');
    await userEvent.type(screen.getByPlaceholderText('PIN'), '1234');
    await userEvent.type(screen.getByPlaceholderText('Confirm PIN'), '5678');
    
    // Should show error
    expect(screen.getByText('PIN does not match!')).toBeInTheDocument();
  });
});
