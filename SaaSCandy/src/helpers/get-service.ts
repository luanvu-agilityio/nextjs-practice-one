import { services } from '@/constants';
import { Service } from '@/types';

/**
 * Returns all available service objects.
 * @returns An array of all service objects.
 */
export function getAllServices(): Service[] {
  return services;
}

/**
 * Finds and returns a service object by its slug.
 * @param slug - The unique identifier for the service.
 * @returns The service object if found, otherwise null.
 */
export function getServiceBySlug(slug: string): Service | null {
  return services.find(service => service.slug === slug) || null;
}

/**
 * Returns an array of all service slugs.
 * @returns An array of strings representing service slugs.
 */
export function getServiceSlugs(): string[] {
  return services.map(service => service.slug);
}
