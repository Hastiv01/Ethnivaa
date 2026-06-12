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
    { name: 'Men', slug: 'men', description: 'Menswear' },
    { name: 'Women', slug: 'women', description: 'Womenswear' },
    { name: 'Accessories', slug: 'accessories', description: 'Accessories and add-ons' },
  ];

  for (const categoryData of categories) {
    await Category.findOrCreate({
      where: { slug: categoryData.slug },
      defaults: categoryData,
    });
  }

  const menCategory = await Category.findOne({ where: { slug: 'men' } });
  const womenCategory = await Category.findOne({ where: { slug: 'women' } });

  await Product.findOrCreate({
    where: { title: 'Classic Cotton Kurta' },
    defaults: {
      title: 'Classic Cotton Kurta',
      description: 'Breathable hand-finished cotton kurta.',
      price: 1999,
      discountPrice: 1799,
      color: 'Ivory',
      inventory: 12,
      CategoryId: menCategory.id,
    },
  });

  await Product.findOrCreate({
    where: { title: 'Embroidered Dress' },
    defaults: {
      title: 'Embroidered Dress',
      description: 'Elegant embroidered dress with relaxed fit.',
      price: 2999,
      discountPrice: 2499,
      color: 'Maroon',
      inventory: 8,
      CategoryId: womenCategory.id,
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
