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

  // Always update password and name in database if they are defined in env variables
  await adminUser.update({
    name: adminName,
    passwordHash: await bcrypt.hash(adminPassword, 10),
    role: 'ADMIN'
  });
  console.log(`Synced admin credentials in database for: ${adminEmail}`);

  if (!adminUser.emailVerifiedAt) {
    await adminUser.update({ emailVerifiedAt: new Date() });
  }

  const [defaultCategory] = await Category.findOrCreate({
    where: { slug: 'heritage-collection' },
    defaults: {
      name: 'Heritage Collection',
      slug: 'heritage-collection',
      description: 'Traditional Indian heritage jewelry boutique',
    },
  });

  await Product.findOrCreate({
    where: { title: 'Mayur Pankh Oxidized Choker Set' },
    defaults: {
      categoryId: defaultCategory.id,
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
      reviewsCount: 2,
    },
  });

  await Product.findOrCreate({
    where: { title: 'Royal Kundan Hasli Necklace Set' },
    defaults: {
      categoryId: defaultCategory.id,
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
      reviewsCount: 2,
    },
  });

  await Product.findOrCreate({
    where: { title: 'Antique Oxidized Chandbali Earrings' },
    defaults: {
      categoryId: defaultCategory.id,
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
      reviewsCount: 2,
    },
  });

  await Address.findOrCreate({
    where: { label: 'Default Shipping' },
    defaults: {
      userId: adminUser.id,
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
