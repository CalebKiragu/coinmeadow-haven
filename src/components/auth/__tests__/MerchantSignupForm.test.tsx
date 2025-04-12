
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import MerchantSignupForm from '../MerchantSignupForm';
import { ApiService } from '@/lib/services';

// Mock the API service
vi.mock('@/lib/services', () => ({
  ApiService: {
    verifyMerchantEmail: vi.fn(),
    verifyMerchantPhone: vi.fn(),
    signupMerchant: vi.fn(),
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

describe('MerchantSignupForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders merchant signup form correctly', () => {
    render(<MerchantSignupForm />);
    
    // Check for key elements
    expect(screen.getByText('Create Merchant Account')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Phone' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Business Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('progresses through merchant email signup flow', async () => {
    const mockVerifyEmail = ApiService.verifyMerchantEmail as vi.Mock;
    mockVerifyEmail.mockResolvedValue({ otpId: '123' });
    
    render(<MerchantSignupForm />);
    
    // Step 1: Enter business email
    await userEvent.type(screen.getByPlaceholderText('Business Email'), 'business@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    
    // Check API call
    expect(mockVerifyEmail).toHaveBeenCalledWith('business@example.com', undefined, undefined);
    
    // Step 2: Verify OTP
    await waitFor(() => {
      expect(screen.getByText(/Enter the 4-digit code/)).toBeInTheDocument();
    });
    
    // Simulate OTP input
    mockVerifyEmail.mockResolvedValue({ success: true });
    const otpInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < otpInputs.length && i < 4; i++) {
      await userEvent.type(otpInputs[i], i.toString());
    }
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    
    // Step 3: Business information
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Merchant Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Representative Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Representative Contact')).toBeInTheDocument();
    });
  });

  it('validates merchant signup PIN matching in final step', async () => {
    const mockVerifyEmail = ApiService.verifyMerchantEmail as vi.Mock;
    mockVerifyEmail.mockResolvedValue({ otpId: '123' });
    
    render(<MerchantSignupForm />);
    
    // Go to step 3 directly (simplifying previous steps for this test)
    await userEvent.type(screen.getByPlaceholderText('Business Email'), 'business@example.com');
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
      expect(screen.getByPlaceholderText('Merchant Name')).toBeInTheDocument();
    });
    
    // Enter mismatching PINs
    await userEvent.type(screen.getByPlaceholderText('Merchant Name'), 'Test Shop');
    await userEvent.type(screen.getByPlaceholderText('Representative Name'), 'Jane Doe');
    await userEvent.type(screen.getByPlaceholderText('Representative Contact'), '+12345678900');
    await userEvent.type(screen.getByPlaceholderText('PIN'), '1234');
    await userEvent.type(screen.getByPlaceholderText('Confirm PIN'), '5678');
    
    // Should show error
    expect(screen.getByText('PIN does not match!')).toBeInTheDocument();
  });
});
