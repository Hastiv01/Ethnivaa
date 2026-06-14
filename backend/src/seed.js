require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User, Category, Product, Address } = require('./models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@ethnivaa.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'change_me_now';
  const adminName = process.env.SEED_ADMIN_NAME || 'Admin';

  const [adminUser] = await User.findOrCreate({
    where: { email: adminEmail },
    defaults: {
      name: adminName,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: 'ADMIN',
      authProvider: 'EMAIL',
      emailVerifiedAt: new Date(),
    },
  });

  if (adminUser.role !== 'ADMIN') {
    await adminUser.update({ role: 'ADMIN' });
  }

  if (!adminUser.emailVerifiedAt) {
    await adminUser.update({ emailVerifiedAt: new Date() });
  }

  const categories = [
    { name: 'Bangles', slug: 'bangles', description: 'Handcrafted heritage bangles' },
    { name: 'Earrings', slug: 'earrings', description: 'Traditional and casual earrings' },
    { name: 'Hair Accessories', slug: 'hair-accessories', description: 'Bridal and festive hair ornaments' },
    { name: 'Necklaces', slug: 'necklaces', description: 'Intricate necklaces and choker sets' },
    { name: 'Combo Sets', slug: 'combo-sets', description: 'Complete matched jewelry combinations' },
  ];

  for (const categoryData of categories) {
    await Category.findOrCreate({
      where: { slug: categoryData.slug },
      defaults: categoryData,
    });
  }

  const banglesCat = await Category.findOne({ where: { slug: 'bangles' } });
  const earringsCat = await Category.findOne({ where: { slug: 'earrings' } });
  const hairAccessoriesCat = await Category.findOne({ where: { slug: 'hair-accessories' } });
  const necklacesCat = await Category.findOne({ where: { slug: 'necklaces' } });
  const comboSetsCat = await Category.findOne({ where: { slug: 'combo-sets' } });

  await Product.findOrCreate({
    where: { title: 'Mayur Pankh Oxidized Choker Set' },
    defaults: {
      title: 'Mayur Pankh Oxidized Choker Set',
      description: 'This peacock-inspired oxidized silver choker features intricate hand-carved detailing and dangling metal beads. Perfect for pairing with ethnic ghagras and sarees during Garba nights.',
      price: 1899,
      originalPrice: 2499,
      color: 'Oxidized Silver',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80'
      ],
      inventory: 25,
      material: 'Oxidized Silver',
      occasion: 'Festive',
      materialsDetail: 'Premium grade Oxidized German Silver alloy with synthetic black beads. Lead and nickel free as per international standards.',
      careInstructions: 'Keep away from moisture, perfumes, and direct heat. Store in the airtight Ethnivaa velvet pouch when not in use.',
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.8,
      reviewsCount: 2,
      CategoryId: comboSetsCat.id,
    },
  });

  await Product.findOrCreate({
    where: { title: 'Royal Kundan Hasli Necklace Set' },
    defaults: {
      title: 'Royal Kundan Hasli Necklace Set',
      description: 'An absolute masterpiece of traditional craftsmanship. This Royal Kundan Hasli is embellished with high-grade hand-cut glass stones, pearls, and green meenakari work on the reverse side.',
      price: 8499,
      originalPrice: 10999,
      color: 'Gold Plated',
      image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&auto=format&fit=crop&q=80'
      ],
      inventory: 8,
      material: 'Gold Plated',
      occasion: 'Bridal',
      materialsDetail: '22K Gold plating over brass base, set with finest Jadau Kundan glass stones, fresh water pearls.',
      careInstructions: 'Avoid contact with chemicals and perfumes. Wipe clean after wearing to remove oils or sweat.',
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.9,
      reviewsCount: 2,
      CategoryId: comboSetsCat.id,
    },
  });

  await Product.findOrCreate({
    where: { title: 'Antique Oxidized Chandbali Earrings' },
    defaults: {
      title: 'Antique Oxidized Chandbali Earrings',
      description: 'Timeless crescent moon Chandbalis featuring delicate filigree work, tiny floral motifs, and pearls hanging at the border. Lightweight enough for daily or festive styling.',
      price: 999,
      originalPrice: 1499,
      color: 'Oxidized Silver',
      image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80'
      ],
      inventory: 50,
      material: 'Oxidized Silver',
      occasion: 'Casual Wear',
      materialsDetail: '92.5 Sterling Silver plating on copper alloy, oxidized for a rustic, vintage look.',
      careInstructions: 'Clean with a dry polishing cloth. Avoid storage in damp areas like bathrooms.',
      isBestSeller: true,
      isNewArrival: false,
      rating: 4.6,
      reviewsCount: 2,
      CategoryId: earringsCat.id,
    },
  });

  await Address.findOrCreate({
    where: { label: 'Default Shipping' },
    defaults: {
      UserId: adminUser.id,
      label: 'Default Shipping',
      recipientName: adminName,
      phone: '0000000000',
      line1: 'Seed Address Line 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      isDefault: true,
    },
  });

  console.log('Seed completed');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await sequelize.close();
  });
