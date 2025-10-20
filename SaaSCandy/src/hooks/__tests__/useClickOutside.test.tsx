import { useOutsideClick } from '@/hooks/useClickOutside';
import { renderHook, act } from '@testing-library/react';
import { createRef } from 'react';

describe('useOutsideClick Hook', () => {
  it('should not call handler when disabled', () => {
    const ref = createRef<HTMLDivElement>();
    const handler = jest.fn();

    renderHook(() => useOutsideClick({ ref, handler, enabled: false }));

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown'));
    });

    expect(handler).not.toHaveBeenCalled();
  });
});

// useKeyDown Hook Tests
import { useKeyDown } from '@/hooks/useKeyDown';

describe('useKeyDown Hook', () => {
  it('should call handler when specified key pressed', () => {
    const handler = jest.fn();

    renderHook(() =>
      useKeyDown({ keys: ['Escape', 'Enter'], handler, enabled: true })
    );

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(handler).toHaveBeenCalledWith('Escape');
  });

  it('should not call handler for non-specified keys', () => {
    const handler = jest.fn();

    renderHook(() => useKeyDown({ keys: ['Escape'], handler }));

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handler when disabled', () => {
    const handler = jest.fn();

    renderHook(() => useKeyDown({ keys: ['Escape'], handler, enabled: false }));

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
