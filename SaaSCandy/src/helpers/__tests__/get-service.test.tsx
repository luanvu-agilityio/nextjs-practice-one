import {
  getAllServices,
  getServiceBySlug,
  getServiceSlugs,
} from '@/helpers/get-service';
import { services } from '@/constants';

jest.mock('@/constants', () => ({
  services: [
    {
      slug: 'web-dev',
      title: 'Web Development',
      description: 'Build websites',
      subtitle: 'Modern web apps',
    },
    {
      slug: 'mobile-dev',
      title: 'Mobile Development',
      description: 'Build mobile apps',
      subtitle: 'iOS and Android',
    },
  ],
}));

describe('Get Service Helpers', () => {
  describe('getAllServices', () => {
    it('should return all services', () => {
      const result = getAllServices();

      expect(result).toHaveLength(2);
      expect(result).toEqual(services);
    });
  });

  describe('getServiceBySlug', () => {
    it('should return service matching slug', () => {
      const result = getServiceBySlug('web-dev');

      expect(result).toEqual(services[0]);
    });

    it('should return null when service not found', () => {
      const result = getServiceBySlug('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getServiceSlugs', () => {
    it('should return array of service slugs', () => {
      const result = getServiceSlugs();

      expect(result).toEqual(['web-dev', 'mobile-dev']);
    });
  });
});

// useClickOutside Hook Tests
import { useOutsideClick } from '@/hooks/useClickOutside';
import { createRef } from 'react';
import { act, renderHook } from '@testing-library/react';

describe('useOutsideClick Hook', () => {
  it('should call handler when clicking outside element', () => {
    const ref = createRef<HTMLDivElement>();
    const handler = jest.fn();

    renderHook(() => useOutsideClick({ ref, handler, enabled: true }));

    // create and attach an inside element and assign it to the ref so the hook
    // can determine which element is "inside"
    const insideElement = document.createElement('div');
    document.body.appendChild(insideElement);
    ref.current = insideElement;

    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);

    act(() => {
      outsideElement.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
    });

    expect(handler).toHaveBeenCalled();

    document.body.removeChild(outsideElement);
    document.body.removeChild(insideElement);
  });

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
