
import { describe, it, expect, vi, beforeEach } from '../../../test/test-imports';
import { render, screen, fireEvent, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import { ApiService } from '@/lib/services';

// Mock the API service
vi.mock('@/lib/services', () => ({
  ApiService: {
    loginUser: vi.fn(),
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

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<LoginForm />);
    
    // Check for key elements
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Phone' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('4-digit PIN')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Forgot PIN?')).toBeInTheDocument();
  });

  it('switches between email and phone tabs', async () => {
    render(<LoginForm />);
    
    // Initially shows email input
    expect(screen.getByPlaceholderText('Email')).toBeVisible();
    
    // Click on Phone tab
    const phoneTab = screen.getByRole('tab', { name: 'Phone' });
    await userEvent.click(phoneTab);
    
    // Should now show phone input
    expect(screen.getByPlaceholderText('Phone (e.g., +254700000000)')).toBeVisible();
  });

  it('toggles PIN visibility', async () => {
    render(<LoginForm />);
    
    const pinInput = screen.getByPlaceholderText('4-digit PIN');
    expect(pinInput).toHaveAttribute('type', 'password');
    
    // Click eye icon to toggle visibility
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button
    await userEvent.click(toggleButton);
    
    // PIN should now be visible
    expect(pinInput).toHaveAttribute('type', 'text');
  });

  it('submits the form with email and PIN', async () => {
    const mockLoginUser = ApiService.loginUser as vi.Mock;
    mockLoginUser.mockResolvedValueOnce({ user: { firstName: 'Test' }, otp: { otpId: '123' } });
    
    render(<LoginForm />);
    
    // Fill out the form
    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('4-digit PIN'), '1234');
    
    // Submit the form
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await userEvent.click(loginButton);
    
    // Check if API was called with correct data
    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        pin: '1234',
      });
    });
  });

  it('shows OTP verification screen after successful login', async () => {
    const mockLoginUser = ApiService.loginUser as vi.Mock;
    mockLoginUser.mockResolvedValueOnce({ user: { firstName: 'Test' }, otp: { otpId: '123' } });
    
    render(<LoginForm />);
    
    // Login
    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('4-digit PIN'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // OTP verification screen should be shown
    await waitFor(() => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });
  });

  it('handles login errors correctly', async () => {
    const mockLoginUser = ApiService.loginUser as vi.Mock;
    mockLoginUser.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    const { store } = render(<LoginForm />);
    
    // Fill out and submit form
    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('4-digit PIN'), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    
    // Check if error was stored in Redux state
    await waitFor(() => {
      const state = store.getState();
      expect(state.auth.error).not.toBeNull();
    });
  });
});
