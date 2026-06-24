export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  description: string;
  reviews: Review[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}


