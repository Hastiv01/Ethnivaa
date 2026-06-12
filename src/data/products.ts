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
  category: 'Bangles' | 'Earrings' | 'Hair Accessories' | 'Necklaces' | 'Combo Sets';
  material: '22K Gold' | 'Sterling Silver' | 'Gold Plated' | 'Oxidized Silver' | 'Brass';
  occasion: 'Festive' | 'Bridal' | 'Casual Wear' | 'Party Wear';
  images: string[];
  description: string;
  materialsDetail: string;
  careInstructions: string;
  stock: number;
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
    category: 'Combo Sets',
    material: 'Oxidized Silver',
    occasion: 'Festive',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'This peacock-inspired oxidized silver choker features intricate hand-carved detailing and dangling metal beads. Perfect for pairing with ethnic ghagras and sarees during Garba nights.',
    materialsDetail: 'Premium grade Oxidized German Silver alloy with synthetic black beads. Lead and nickel free as per international standards.',
    careInstructions: 'Keep away from moisture, perfumes, and direct heat. Store in the airtight Ethnivaa velvet pouch provided when not in use. Clean gently with a soft dry cotton cloth.',
    stock: 25,
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
    category: 'Combo Sets',
    material: 'Gold Plated',
    occasion: 'Bridal',
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'An absolute masterpiece of traditional craftsmanship. This Royal Kundan Hasli is embellished with high-grade hand-cut glass stones, pearls, and green meenakari work on the reverse side.',
    materialsDetail: '22K Gold plating over brass base, set with finest Jadau Kundan glass stones, fresh water pearls, and micro-plated red beads.',
    careInstructions: 'Avoid contact with chemicals, hairsprays, and perfumes. Wipe clean after wearing to remove oils or sweat. Store wrapped in cotton tissue inside a hard box.',
    stock: 8,
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
    category: 'Combo Sets',
    material: '22K Gold',
    occasion: 'Bridal',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Handcrafted temple jewelry waistband featuring the divine figure of Goddess Lakshmi seated on a lotus, flanked by dancing peacocks. Adorned with red kemp stones and hanging gold beads.',
    materialsDetail: 'Handcrafted in copper base with extra-thick 22K antique gold gilding, encrusted with premium pink/red kemp glass stones.',
    careInstructions: 'Handle with care. Gold plating is premium but delicate. Avoid pulling. Store horizontally in the custom velvet box provided.',
    stock: 5,
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
    category: 'Earrings',
    material: 'Oxidized Silver',
    occasion: 'Casual Wear',
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Timeless crescent moon Chandbalis featuring delicate filigree work, tiny floral motifs, and pearls hanging at the border. Lightweight enough for daily or festive styling.',
    materialsDetail: '92.5 Sterling Silver plating on copper alloy, oxidized for a rustic, vintage look. Hypoallergenic posts.',
    careInstructions: 'Clean with a dry polishing cloth. Avoid storage in damp areas like bathrooms. Protect from contact with cosmetic sprays.',
    stock: 50,
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
    category: 'Necklaces',
    material: 'Gold Plated',
    occasion: 'Festive',
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'A classic heritage necklace from Andhra Pradesh. Guttapusalu literally translates to a shoal of small fish. This piece features clusters of high-quality seed pearls fringe, lined with kemp rubies and emeralds.',
    materialsDetail: 'High-micron gold-plated brass base, natural seed pearls, synthetic emeralds, and ruby kemp stones.',
    careInstructions: 'Do not wash or immerse in water. Avoid spraying perfume over the pearl clusters. Wrap in soft cotton fabric.',
    stock: 12,
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
    category: 'Bangles',
    material: 'Oxidized Silver',
    occasion: 'Festive',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'A stack of six rustic oxidized bangles accented with musical ghungroos (jingling metal beads). Adds that cheerful festive chime and rustic bohemian charm to your movement.',
    materialsDetail: 'Alloy of brass and copper coated in antique oxidized silver. Resilient and slightly adjustable for comfort.',
    careInstructions: 'Keep in airtight zip locks. Keep away from water to preserve the musical ring of the beads.',
    stock: 30,
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
    category: 'Necklaces',
    material: '22K Gold',
    occasion: 'Bridal',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'A heavy bridal pendant intricately depicting Lord Venkateswara of Tirupati, adorned with classical patterns, ruby cabochons, and dangling gold balls. Symbol of devotion and high heritage.',
    materialsDetail: 'Solid base copper with certified 22K antique gold overlay (3.0 microns thick) and authentic synthetic kemp rubies.',
    careInstructions: 'Clean only with jewelry specialized cloth. Avoid storing near other metal ornaments to prevent scratches on the lord figure carving.',
    stock: 3,
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
    category: 'Hair Accessories',
    material: 'Gold Plated',
    occasion: 'Bridal',
    images: [
      'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Frame your forehead with bridal elegance. This tikka features a classic floral center encrusted with uncut Kundan and framed with pearl drops and red beads, suspended from a pearl-accented chain.',
    materialsDetail: 'Brass base, 18K gold-plated, premium glass Kundan stones, faux pearls and crystals.',
    careInstructions: 'Do not apply makeup or hairspray after putting it on. Put it on as the final accessory of your bridal makeup. Wipe off sweat before storing.',
    stock: 18,
    isBestSeller: false,
    isNewArrival: false,
    reviews: [
      { id: 'rev-11', userName: 'Kriti D.', rating: 4, date: '2026-05-25', comment: 'Very pretty. Stays in place perfectly. The gold tone matches my other gold jewelry.', verified: true }
    ]
  }
];
