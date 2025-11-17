import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { ClientApiProvider, useClientApi } from './ClientApiProvider';

describe('ClientApiProvider', () => {
  it('should render children', () => {
    render(
      <ClientApiProvider>
        <div>Test Child</div>
      </ClientApiProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should provide ClientApi instance', () => {
    const { result } = renderHook(() => useClientApi(), {
      wrapper: ClientApiProvider,
    });

    expect(result.current).toBeDefined();
    expect(result.current.searchUsers).toBeDefined();
    expect(result.current.fetchUserRepositories).toBeDefined();
  });

  it('should provide the same instance across renders', () => {
    const { result, rerender } = renderHook(() => useClientApi(), {
      wrapper: ClientApiProvider,
    });

    const firstInstance = result.current;
    rerender();
    const secondInstance = result.current;

    expect(firstInstance).toBe(secondInstance);
  });

  it('should allow calling searchUsers through context', async () => {
    const { result } = renderHook(() => useClientApi(), {
      wrapper: ClientApiProvider,
    });

    expect(typeof result.current.searchUsers).toBe('function');
  });

  it('should allow calling fetchUserRepositories through context', async () => {
    const { result } = renderHook(() => useClientApi(), {
      wrapper: ClientApiProvider,
    });

    expect(typeof result.current.fetchUserRepositories).toBe('function');
  });
});

describe('useClientApi', () => {
  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useClientApi());
    }).toThrow('useClientApi must be used within a ClientApiProvider');
  });

  it('should return ClientApi instance when used inside provider', () => {
    const { result } = renderHook(() => useClientApi(), {
      wrapper: ClientApiProvider,
    });

    expect(result.current).toBeDefined();
    expect(typeof result.current.searchUsers).toBe('function');
    expect(typeof result.current.fetchUserRepositories).toBe('function');
  });
});
