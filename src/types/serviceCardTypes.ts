interface ServiceCardPrice {
  value: string;
  periodicity?: string;
}

export interface IServiceCard {
  title: string;
  price: ServiceCardPrice;
  features: string[];
}
