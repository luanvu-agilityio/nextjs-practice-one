export interface ServiceFeature {
  id: string;
  title: string;
  description: string;
}

export interface Service {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  whatItDoes: {
    title: string;
    description: string;
    image: string;
  };
  features: ServiceFeature[];
  icon: string;
}
