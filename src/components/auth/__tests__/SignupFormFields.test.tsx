
import { describe, it, expect, vi } from '../../../test/test-imports';
import { render, screen } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import SignupFormFields from '../SignupFormFields';
import { countries } from '@/types/currency';

describe('SignupFormFields Component', () => {
  const defaultProps = {
    country: 'US',
    setCountry: vi.fn(),
    refId: '',
    setFirstName: vi.fn(),
    setLastName: vi.fn(),
    setPin: vi.fn(),
    setRefId: vi.fn(),
  };

  it('renders correctly with all fields', () => {
    render(<SignupFormFields {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // Country select
    expect(screen.getByPlaceholderText('PIN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm PIN')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Referral ID (Optional)')).toBeInTheDocument();
  });

  it('calls the appropriate setters when form fields change', async () => {
    const mockSetFirstName = vi.fn();
    const mockSetLastName = vi.fn();
    const mockSetRefId = vi.fn();
    
    render(
      <SignupFormFields 
        {...defaultProps}
        setFirstName={mockSetFirstName}
        setLastName={mockSetLastName}
        setRefId={mockSetRefId}
      />
    );
    
    // Enter first name
    await userEvent.type(screen.getByPlaceholderText('First Name'), 'John');
    expect(mockSetFirstName).toHaveBeenCalledWith('John');
    
    // Enter last name
    await userEvent.type(screen.getByPlaceholderText('Last Name'), 'Doe');
    expect(mockSetLastName).toHaveBeenCalledWith('Doe');
    
    // Enter referral ID
    await userEvent.type(screen.getByPlaceholderText('Referral ID (Optional)'), 'REF123');
    expect(mockSetRefId).toHaveBeenCalledWith('REF123');
  });

  it('validates PIN matching', async () => {
    const mockSetPin = vi.fn();
    
    render(
      <SignupFormFields 
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

  it('displays country selection correctly', async () => {
    const mockSetCountry = vi.fn();
    
    render(
      <SignupFormFields 
        {...defaultProps}
        country="US"
        setCountry={mockSetCountry}
      />
    );
    
    // This is a simplified test since the actual Select component from shadcn 
    // would require more complex interaction tests
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    
    // Testing the actual selection would require more complex interaction with the shadcn/ui Select component
  });
});
