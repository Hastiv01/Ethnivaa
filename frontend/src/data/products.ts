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

export const mockProducts: Product[] = [
  {
    id: 'eth-001',
    name: 'Mayur Pankh Oxidized Choker Set',
    price: 1899,
    originalPrice: 2499,
    rating: 4.8,
    reviewsCount: 124,
    images: [
      '/placeholder.png'
    ],
    description: 'This peacock-inspired oxidized silver choker features intricate hand-carved detailing and dangling metal beads. Perfect for pairing with ethnic ghagras and sarees during Garba nights.',
    isBestSeller: true,
    isNewArrival: false,
    reviews: [
      { id: 'rev-1', userName: 'Ananya Sharma', rating: 5, date: '2026-05-12', comment: 'Extremely beautiful! The weight is just perfect, not too heavy. Complements my Navratri chaniya choli amazingly.', verified: true },
      { id: 'rev-2', userName: 'Meera Nair', rating: 4, date: '2026-05-20', comment: 'Quality is very premium. The dark finish is very authentic. Highly recommended!', verified: true }
    ]
  },
  {
    id: 'eth-002',
    name: 'Royal Kundan Hasli Necklace Set',
    price: 8499,
    originalPrice: 10999,
    rating: 4.9,
    reviewsCount: 88,
    images: [
      '/placeholder.png'
    ],
    description: 'An absolute masterpiece of traditional craftsmanship. This Royal Kundan Hasli is embellished with high-grade hand-cut glass stones, pearls, and green meenakari work on the reverse side.',
    isBestSeller: true,
    isNewArrival: false,
    reviews: [
      { id: 'rev-3', userName: 'Radhika Goel', rating: 5, date: '2026-04-18', comment: 'Wore it for my engagement and received endless compliments! The meenakari work on the back is so detailed.', verified: true },
      { id: 'rev-4', userName: 'Kavita Patel', rating: 5, date: '2026-04-29', comment: 'The polish looks exactly like real gold. Masterful craft!', verified: true }
    ]
  },
  {
    id: 'eth-003',
    name: 'Devi Lakshmi Temple Kamarbandh',
    price: 12500,
    originalPrice: 15500,
    rating: 4.7,
    reviewsCount: 42,
    images: [
      '/placeholder.png'
    ],
    description: 'Handcrafted temple jewelry waistband featuring the divine figure of Goddess Lakshmi seated on a lotus, flanked by dancing peacocks. Adorned with red kemp stones and hanging gold beads.',
    isBestSeller: false,
    isNewArrival: true,
    reviews: [
      { id: 'rev-5', userName: 'Shruti Iyer', rating: 5, date: '2026-03-15', comment: 'Stunning craftsmanship. Ideal for classical dancers or South Indian bridal look. Goddess Lakshmi motifs are carved beautifully.', verified: true }
    ]
  },
  {
    id: 'eth-004',
    name: 'Antique Oxidized Chandbali Earrings',
    price: 999,
    originalPrice: 1499,
    rating: 4.6,
    reviewsCount: 205,
    images: [
      '/placeholder.png'
    ],
    description: 'Timeless crescent moon Chandbalis featuring delicate filigree work, tiny floral motifs, and pearls hanging at the border. Lightweight enough for daily or festive styling.',
    isBestSeller: true,
    isNewArrival: false,
    reviews: [
      { id: 'rev-6', userName: 'Priya Sen', rating: 4, date: '2026-05-01', comment: 'Very pretty. They are a bit larger than I expected but super light to wear all day!', verified: true },
      { id: 'rev-7', userName: 'Divya R.', rating: 5, date: '2026-05-14', comment: 'Perfect match for casual kurtas as well as heavier silk sarees. Love the matte black oxidization.', verified: true }
    ]
  },
  {
    id: 'eth-005',
    name: 'Guttapusalu Pearl Kemp Necklace',
    price: 6999,
    originalPrice: 8999,
    rating: 4.8,
    reviewsCount: 56,
    images: [
      '/placeholder.png'
    ],
    description: 'A classic heritage necklace from Andhra Pradesh. Guttapusalu literally translates to a shoal of small fish. This piece features clusters of high-quality seed pearls fringe, lined with kemp rubies and emeralds.',
    isBestSeller: false,
    isNewArrival: false,
    reviews: [
      { id: 'rev-8', userName: 'Latha Reddy', rating: 5, date: '2026-05-05', comment: 'The pearl bunches are extremely thick and luxurious. The length is adjustable. Beautiful!', verified: true }
    ]
  },
  {
    id: 'eth-006',
    name: 'Navratri Special Ghungroo Bangle Set',
    price: 1499,
    originalPrice: 1999,
    rating: 4.5,
    reviewsCount: 79,
    images: [
      '/placeholder.png'
    ],
    description: 'A stack of six rustic oxidized bangles accented with musical ghungroos (jingling metal beads). Adds that cheerful festive chime and rustic bohemian charm to your movement.',
    isBestSeller: false,
    isNewArrival: true,
    reviews: [
      { id: 'rev-9', userName: 'Neha Mehta', rating: 5, date: '2026-04-10', comment: 'Gives the best traditional touch for Dandiya night! The sound of the ghungroos is beautiful.', verified: true }
    ]
  },
  {
    id: 'eth-007',
    name: 'Vaikuntha Venkateswara Gold Pendant',
    price: 18500,
    originalPrice: 22000,
    rating: 5.0,
    reviewsCount: 31,
    images: [
      '/placeholder.png'
    ],
    description: 'A heavy bridal pendant intricately depicting Lord Venkateswara of Tirupati, adorned with classical patterns, ruby cabochons, and dangling gold balls. Symbol of devotion and high heritage.',
    isBestSeller: true,
    isNewArrival: true,
    reviews: [
      { id: 'rev-10', userName: 'Vasudha V.', rating: 5, date: '2026-05-18', comment: 'Exquisite carving! Looks very royal and divine. Truly a heirloom piece.', verified: true }
    ]
  },
  {
    id: 'eth-008',
    name: 'Sheesh Mahal Kundan Maang Tikka',
    price: 2499,
    originalPrice: 3499,
    rating: 4.7,
    reviewsCount: 64,
    images: [
      '/placeholder.png'
    ],
    description: 'Frame your forehead with bridal elegance. This tikka features a classic floral center encrusted with uncut Kundan and framed with pearl drops and red beads, suspended from a pearl-accented chain.',
    isBestSeller: false,
    isNewArrival: false,
    reviews: [
      { id: 'rev-11', userName: 'Kriti D.', rating: 4, date: '2026-05-25', comment: 'Very pretty. Stays in place perfectly. The gold tone matches my other gold jewelry.', verified: true }
    ]
  }
];
