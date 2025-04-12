
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import ThirdPartyAuth from '../ThirdPartyAuth';

// Mock the use-toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
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
    const { toast } = vi.mocked(require('@/hooks/use-toast').useToast());
    
    render(<ThirdPartyAuth />);
    
    // Click Google authentication
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    
    // Check toast
    expect(toast).toHaveBeenCalledWith({
      title: 'Google sign up',
      description: 'This feature is coming soon!',
    });
  });

  it('shows toast when Twitter authentication is clicked', async () => {
    const { toast } = vi.mocked(require('@/hooks/use-toast').useToast());
    
    render(<ThirdPartyAuth />);
    
    // Click Twitter authentication
    await userEvent.click(screen.getByRole('button', { name: 'Continue with Twitter' }));
    
    // Check toast
    expect(toast).toHaveBeenCalledWith({
      title: 'Twitter sign up',
      description: 'This feature is coming soon!',
    });
  });
});
