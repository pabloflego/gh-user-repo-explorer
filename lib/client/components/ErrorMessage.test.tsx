import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    const message = 'Something went wrong';
    render(<ErrorMessage message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('should display different error messages', () => {
    const message1 = 'Error 1';
    const { rerender } = render(<ErrorMessage message={message1} />);
    
    expect(screen.getByText(message1)).toBeInTheDocument();
    
    const message2 = 'Error 2';
    rerender(<ErrorMessage message={message2} />);
    
    expect(screen.getByText(message2)).toBeInTheDocument();
    expect(screen.queryByText(message1)).not.toBeInTheDocument();
  });

  it('should render long error messages', () => {
    const longMessage = 'This is a very long error message that should still be displayed correctly in the error component without any issues or truncation.';
    render(<ErrorMessage message={longMessage} />);
    
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });
});
