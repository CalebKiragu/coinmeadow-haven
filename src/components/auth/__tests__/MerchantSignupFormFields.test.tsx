
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import MerchantSignupFormFields from '../MerchantSignupFormFields';

describe('MerchantSignupFormFields Component', () => {
  const defaultProps = {
    refId: '',
    setMerchantName: vi.fn(),
    setRepName: vi.fn(),
    setRepContact: vi.fn(),
    setPin: vi.fn(),
    setRefId: vi.fn(),
  };

  it('renders correctly with all merchant fields', () => {
    render(<MerchantSignupFormFields {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Merchant Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Representative Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Representative Contact')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('PIN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm PIN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Referral ID (Optional)')).toBeInTheDocument();
  });

  it('calls the appropriate setters when merchant form fields change', async () => {
    const mockSetMerchantName = vi.fn();
    const mockSetRepName = vi.fn();
    const mockSetRepContact = vi.fn();
    const mockSetRefId = vi.fn();
    
    render(
      <MerchantSignupFormFields 
        {...defaultProps}
        setMerchantName={mockSetMerchantName}
        setRepName={mockSetRepName}
        setRepContact={mockSetRepContact}
        setRefId={mockSetRefId}
      />
    );
    
    // Enter merchant name
    await userEvent.type(screen.getByPlaceholderText('Merchant Name'), 'ABC Store');
    expect(mockSetMerchantName).toHaveBeenCalledWith('ABC Store');
    
    // Enter representative name
    await userEvent.type(screen.getByPlaceholderText('Representative Name'), 'Jane Smith');
    expect(mockSetRepName).toHaveBeenCalledWith('Jane Smith');
    
    // Enter representative contact
    await userEvent.type(screen.getByPlaceholderText('Representative Contact'), '+12345678900');
    expect(mockSetRepContact).toHaveBeenCalledWith('+12345678900');
    
    // Enter referral ID
    await userEvent.type(screen.getByPlaceholderText('Referral ID (Optional)'), 'MREF123');
    expect(mockSetRefId).toHaveBeenCalledWith('MREF123');
  });

  it('validates merchant PIN matching', async () => {
    const mockSetPin = vi.fn();
    
    render(
      <MerchantSignupFormFields 
        {...defaultProps}
        setPin={mockSetPin}
      />
    );
    
    // Enter matching PINs
    await userEvent.type(screen.getByPlaceholderText('PIN'), '1234');
    await userEvent.type(screen.getByPlaceholderText('Confirm PIN'), '1234');
    
    // Error message should not be shown
    expect(screen.queryByText('PIN does not match!')).not.toBeInTheDocument();
    expect(mockSetPin).toHaveBeenCalledWith('1234');
    
    // Clear and enter mismatching PINs
    await userEvent.clear(screen.getByPlaceholderText('PIN'));
    await userEvent.clear(screen.getByPlaceholderText('Confirm PIN'));
    await userEvent.type(screen.getByPlaceholderText('PIN'), '1234');
    await userEvent.type(screen.getByPlaceholderText('Confirm PIN'), '5678');
    
    // Error message should be shown
    expect(screen.getByText('PIN does not match!')).toBeInTheDocument();
    // Pin setter should not be called with the mismatched value
    expect(mockSetPin).not.toHaveBeenCalledWith('5678');
  });

  it('prefills referral ID from props', () => {
    render(
      <MerchantSignupFormFields 
        {...defaultProps}
        refId="PREFILLED123"
      />
    );
    
    const refIdInput = screen.getByPlaceholderText('Referral ID (Optional)');
    expect(refIdInput).toHaveValue('PREFILLED123');
  });
});
