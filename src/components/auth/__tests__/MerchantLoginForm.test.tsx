
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import MerchantLoginForm from '../MerchantLoginForm';
import { ApiService } from '@/lib/services';

// Mock the API service
vi.mock('@/lib/services', () => ({
  ApiService: {
    loginMerchant: vi.fn(),
  },
}));

// Mock the react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock the use-toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('MerchantLoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders merchant login form correctly', () => {
    render(<MerchantLoginForm />);
    
    // Check for key elements specific to merchant login
    expect(screen.getByText('Merchant Login')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Phone' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Business Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('4-digit PIN')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Forgot PIN?')).toBeInTheDocument();
  });

  it('switches between email and phone tabs in merchant login', async () => {
    render(<MerchantLoginForm />);
    
    // Initially shows business email input
    expect(screen.getByPlaceholderText('Business Email')).toBeVisible();
    
    // Click on Phone tab
    const phoneTab = screen.getByRole('tab', { name: 'Phone' });
    await userEvent.click(phoneTab);
    
    // Should now show business phone input
    expect(screen.getByPlaceholderText('Business Phone')).toBeVisible();
  });

  it('submits merchant login form with email and PIN', async () => {
    const mockLoginMerchant = ApiService.loginMerchant as vi.Mock;
    mockLoginMerchant.mockResolvedValueOnce({ merchant: { merchantName: 'Test Shop' }, otp: { otpId: '123' } });
    
    render(<MerchantLoginForm />);
    
    // Fill out the form
    await userEvent.type(screen.getByPlaceholderText('Business Email'), 'business@example.com');
    await userEvent.type(screen.getByPlaceholderText('4-digit PIN'), '5678');
    
    // Submit the form
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await userEvent.click(loginButton);
    
    // Check if API was called with correct data
    await waitFor(() => {
      expect(mockLoginMerchant).toHaveBeenCalledWith({
        email: 'business@example.com',
        pin: '5678',
      });
    });
  });

  it('shows OTP verification screen after successful merchant login', async () => {
    const mockLoginMerchant = ApiService.loginMerchant as vi.Mock;
    mockLoginMerchant.mockResolvedValueOnce({ merchant: { merchantName: 'Test Shop' }, otp: { otpId: '123' } });
    
    render(<MerchantLoginForm />);
    
    // Login
    await userEvent.type(screen.getByPlaceholderText('Business Email'), 'business@example.com');
    await userEvent.type(screen.getByPlaceholderText('4-digit PIN'), '5678');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // OTP verification screen should be shown
    await waitFor(() => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });
  });
});
