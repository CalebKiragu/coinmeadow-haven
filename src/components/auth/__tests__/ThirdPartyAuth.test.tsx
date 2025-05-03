
import { describe, it, expect, vi } from '../../../test/test-imports';
import { render, screen, userEvent } from '../../../test/test-utils';
import ThirdPartyAuth from '../ThirdPartyAuth';
import { useToast } from '@/hooks/use-toast';

// Mock the use-toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

describe('ThirdPartyAuth Component', () => {
  it('renders third-party authentication buttons', () => {
    render(<ThirdPartyAuth />);
    
    // Check for divider
    expect(screen.getByText('Or')).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Twitter' })).toBeInTheDocument();
  });

  it('shows toast when Google authentication is clicked', async () => {
    const mockToast = vi.fn();
    vi.mocked(useToast).mockReturnValue({ toast: mockToast, toasts: [], dismiss: vi.fn() });
    
    render(<ThirdPartyAuth />);
    
    // Click Google authentication
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    
    // Check toast
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Google sign up',
      description: 'This feature is coming soon!',
    });
  });

  it('shows toast when Twitter authentication is clicked', async () => {
    const mockToast = vi.fn();
    vi.mocked(useToast).mockReturnValue({ toast: mockToast, toasts: [], dismiss: vi.fn() });
    
    render(<ThirdPartyAuth />);
    
    // Click Twitter authentication
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Twitter' }));
    
    // Check toast
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Twitter sign up',
      description: 'This feature is coming soon!',
    });
  });
});
