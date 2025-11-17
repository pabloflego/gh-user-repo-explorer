import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import SearchBox, { DEBOUNCE_DELAY_MS } from './SearchBox';

describe('SearchBox', () => {
  let mockOnChange: (value: string) => void;
  let mockOnSearch: () => void;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnSearch = vi.fn();
  });

  it('should render input field and button', () => {
    render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Enter username');
    const button = screen.getByRole('button', { name: /search/i });
    
    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('should display the provided value', () => {
    render(<SearchBox value="testuser" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Enter username') as HTMLInputElement;
    expect(input.value).toBe('testuser');
  });

  it('should call onChange when user types', () => {
    render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Enter username');
    fireEvent.change(input, { target: { value: 'a' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('a');
  });

  it('should call onChange with updated value', () => {
    render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Enter username');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('should call onSearch when button is clicked', () => {
    render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    const button = screen.getByRole('button', { name: /search/i });
    fireEvent.click(button);
    
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('should debounce search calls', async () => {
    const { rerender } = render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    rerender(<SearchBox value="a" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalled();
    }, { timeout: DEBOUNCE_DELAY_MS + 200 });
  });

  it('should not trigger search for empty input', async () => {
    render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    await new Promise(resolve => setTimeout(resolve, DEBOUNCE_DELAY_MS + 100));
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should not trigger search for whitespace-only input', async () => {
    const { rerender } = render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    await act(async () => {
      rerender(<SearchBox value="   " onChange={mockOnChange} onSearch={mockOnSearch} />);
      await new Promise(resolve => setTimeout(resolve, DEBOUNCE_DELAY_MS + 100));
    });
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('should trigger search after debounce period', async () => {
    const { rerender } = render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    rerender(<SearchBox value="test" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalled();
    }, { timeout: DEBOUNCE_DELAY_MS + 200 });
  });

  it('should update value when prop changes', () => {
    const { rerender } = render(<SearchBox value="initial" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    let input = screen.getByPlaceholderText('Enter username') as HTMLInputElement;
    expect(input.value).toBe('initial');
    
    rerender(<SearchBox value="updated" onChange={mockOnChange} onSearch={mockOnSearch} />);
    
    input = screen.getByPlaceholderText('Enter username') as HTMLInputElement;
    expect(input.value).toBe('updated');
  });

  describe('Input Sanitization', () => {
    it('should trim whitespace from input', () => {
      render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('Enter username');
      fireEvent.change(input, { target: { value: '  testuser  ' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('testuser');
    });

    it('should replace multiple spaces with single space', () => {
      render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('Enter username');
      fireEvent.change(input, { target: { value: 'test  user' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('test user');
    });

    it('should remove dangerous characters', () => {
      render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('Enter username');
      fireEvent.change(input, { target: { value: '<script>alert("xss")</script>' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('scriptalert(xss)/script');
    });

    it('should remove HTML entities', () => {
      render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('Enter username');
      fireEvent.change(input, { target: { value: 'test&user' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('testuser');
    });

    it('should remove quotes from input', () => {
      render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('Enter username');
      fireEvent.change(input, { target: { value: 'test"user\'name' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('testusername');
    });

    it('should allow alphanumeric and hyphens', () => {
      render(<SearchBox value="" onChange={mockOnChange} onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('Enter username');
      fireEvent.change(input, { target: { value: 'test-user123' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('test-user123');
    });
  });
});
