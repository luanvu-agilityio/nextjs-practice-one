import { services } from '@/constants';
import { Service } from '@/types';

export function getAllServices(): Service[] {
  return services;
}

export function getServiceBySlug(slug: string): Service | null {
  return services.find(service => service.slug === slug) || null;
}

export function getServiceSlugs(): string[] {
  return services.map(service => service.slug);
}
