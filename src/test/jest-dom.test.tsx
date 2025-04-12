
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

describe('Jest DOM Matchers', () => {
  it('should have Jest DOM matchers available', () => {
    render(<div data-testid="test-element">Test</div>);
    const element = screen.getByTestId('test-element');
    
    // Test that Jest DOM matchers are available and working
    expect(element).toBeInTheDocument();
    expect(element).toBeVisible();
    expect(element).toHaveTextContent('Test');
    
    // Add a class to test more matchers
    element.classList.add('test-class');
    expect(element).toHaveClass('test-class');
    
    // Test attribute matcher
    element.setAttribute('data-value', 'test-value');
    expect(element).toHaveAttribute('data-value', 'test-value');
  });
});
