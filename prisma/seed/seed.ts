import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

// ─── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Photography', slug: 'photography', description: 'Professional event photography', sortOrder: 1 },
  { name: 'Videography', slug: 'videography', description: 'Cinematic event video production', sortOrder: 2 },
  { name: 'Catering', slug: 'catering', description: 'Food and beverage services', sortOrder: 3 },
  { name: 'Decor', slug: 'decor', description: 'Event decoration and styling', sortOrder: 4 },
  { name: 'Floral', slug: 'floral', description: 'Floral arrangements and designs', sortOrder: 5 },
  { name: 'DJ & Music', slug: 'dj-music', description: 'DJs and live music entertainment', sortOrder: 6 },
  { name: 'Venues', slug: 'venues', description: 'Event halls and outdoor spaces', sortOrder: 7 },
  { name: 'Bands', slug: 'bands', description: 'Live bands and musical groups', sortOrder: 8 },
  { name: 'Drinks', slug: 'drinks', description: 'Bar and drinks services', sortOrder: 9 },
  { name: 'Emcees', slug: 'emcees', description: 'Professional MCs and hosts', sortOrder: 10 },
  { name: 'Beauty', slug: 'beauty', description: 'Makeup, hair, and beauty services', sortOrder: 11 },
  { name: 'Confectionery', slug: 'confectionery', description: 'Cakes and desserts', sortOrder: 12 },
  { name: 'Security', slug: 'security', description: 'Event security services', sortOrder: 13 },
  { name: 'Transportation', slug: 'transportation', description: 'Guest and bridal transportation', sortOrder: 14 },
  { name: 'Lighting', slug: 'lighting', description: 'Stage and ambient lighting', sortOrder: 15 },
  { name: 'Planning', slug: 'planning', description: 'Full-service event planning', sortOrder: 16 },
];

// ─── Locations ─────────────────────────────────────────────────────────────────

const NIGERIA = {
  name: 'Nigeria',
  code: 'NG',
  dialCode: '+234',
  flagEmoji: '🇳🇬',
};

// Nigerian states with their major cities and approximate coordinates
// lat/lng are city-centre approximations suitable for geo-aware matching
const NIGERIAN_CITIES: Array<{
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}> = [
  // Lagos
  { name: 'Lagos', state: 'Lagos', latitude: 6.5244, longitude: 3.3792 },
  { name: 'Ikeja', state: 'Lagos', latitude: 6.6018, longitude: 3.3515 },
  { name: 'Lekki', state: 'Lagos', latitude: 6.4698, longitude: 3.5852 },
  { name: 'Victoria Island', state: 'Lagos', latitude: 6.4281, longitude: 3.4219 },
  { name: 'Ikorodu', state: 'Lagos', latitude: 6.6194, longitude: 3.5086 },
  // Abuja
  { name: 'Abuja', state: 'FCT', latitude: 9.0765, longitude: 7.3986 },
  { name: 'Garki', state: 'FCT', latitude: 9.0405, longitude: 7.4775 },
  { name: 'Wuse', state: 'FCT', latitude: 9.0643, longitude: 7.4892 },
  { name: 'Maitama', state: 'FCT', latitude: 9.0879, longitude: 7.4955 },
  // Kano
  { name: 'Kano', state: 'Kano', latitude: 12.0022, longitude: 8.5919 },
  // Rivers
  { name: 'Port Harcourt', state: 'Rivers', latitude: 4.8156, longitude: 7.0498 },
  // Oyo
  { name: 'Ibadan', state: 'Oyo', latitude: 7.3775, longitude: 3.9470 },
  // Enugu
  { name: 'Enugu', state: 'Enugu', latitude: 6.4584, longitude: 7.5464 },
  // Anambra
  { name: 'Awka', state: 'Anambra', latitude: 6.2104, longitude: 7.0696 },
  { name: 'Onitsha', state: 'Anambra', latitude: 6.1426, longitude: 6.7881 },
  // Delta
  { name: 'Asaba', state: 'Delta', latitude: 6.1977, longitude: 6.7343 },
  { name: 'Warri', state: 'Delta', latitude: 5.5167, longitude: 5.7500 },
  // Edo
  { name: 'Benin City', state: 'Edo', latitude: 6.3350, longitude: 5.6270 },
  // Ogun
  { name: 'Abeokuta', state: 'Ogun', latitude: 7.1557, longitude: 3.3451 },
  // Osun
  { name: 'Osogbo', state: 'Osun', latitude: 7.7667, longitude: 4.5562 },
  // Ondo
  { name: 'Akure', state: 'Ondo', latitude: 7.2526, longitude: 5.1939 },
  // Ekiti
  { name: 'Ado-Ekiti', state: 'Ekiti', latitude: 7.6217, longitude: 5.2213 },
  // Kwara
  { name: 'Ilorin', state: 'Kwara', latitude: 8.4799, longitude: 4.5418 },
  // Niger
  { name: 'Minna', state: 'Niger', latitude: 9.6139, longitude: 6.5568 },
  // Kogi
  { name: 'Lokoja', state: 'Kogi', latitude: 7.7957, longitude: 6.7409 },
  // Cross River
  { name: 'Calabar', state: 'Cross River', latitude: 4.9517, longitude: 8.3220 },
  // Akwa Ibom
  { name: 'Uyo', state: 'Akwa Ibom', latitude: 5.0554, longitude: 7.9120 },
  // Imo
  { name: 'Owerri', state: 'Imo', latitude: 5.4836, longitude: 7.0334 },
  // Bayelsa
  { name: 'Yenagoa', state: 'Bayelsa', latitude: 4.9267, longitude: 6.2676 },
  // Kaduna
  { name: 'Kaduna', state: 'Kaduna', latitude: 10.5222, longitude: 7.4383 },
  // Plateau
  { name: 'Jos', state: 'Plateau', latitude: 9.8965, longitude: 8.8583 },
  // Benue
  { name: 'Makurdi', state: 'Benue', latitude: 7.7305, longitude: 8.5361 },
  // Nassarawa
  { name: 'Lafia', state: 'Nassarawa', latitude: 8.4897, longitude: 8.5227 },
  // Taraba
  { name: 'Jalingo', state: 'Taraba', latitude: 8.8937, longitude: 11.3673 },
  // Adamawa
  { name: 'Yola', state: 'Adamawa', latitude: 9.2035, longitude: 12.4954 },
  // Gombe
  { name: 'Gombe', state: 'Gombe', latitude: 10.2791, longitude: 11.1671 },
  // Bauchi
  { name: 'Bauchi', state: 'Bauchi', latitude: 10.3158, longitude: 9.8442 },
  // Borno
  { name: 'Maiduguri', state: 'Borno', latitude: 11.8333, longitude: 13.1500 },
  // Yobe
  { name: 'Damaturu', state: 'Yobe', latitude: 11.7469, longitude: 11.9606 },
  // Jigawa
  { name: 'Dutse', state: 'Jigawa', latitude: 11.7566, longitude: 9.3448 },
  // Katsina
  { name: 'Katsina', state: 'Katsina', latitude: 12.9889, longitude: 7.6006 },
  // Kebbi
  { name: 'Birnin Kebbi', state: 'Kebbi', latitude: 12.4539, longitude: 4.1975 },
  // Sokoto
  { name: 'Sokoto', state: 'Sokoto', latitude: 13.0059, longitude: 5.2476 },
  // Zamfara
  { name: 'Gusau', state: 'Zamfara', latitude: 12.1704, longitude: 6.6649 },
];

// ─── Subscription Plans ────────────────────────────────────────────────────────

// USD pricing per the 4 June MoM (#24). Subscription-only model: no commission.
const SUBSCRIPTION_PLANS = [
  {
    tier: 'BASIC' as const,
    name: 'Basic',
    priceMonthly: 0,
    priceYearly: 0,
    // Canonical currency is NGN (Paystack merchant). For Stripe the API
    // recalculates to USD at NGN_TO_USD_RATE.
    currency: 'NGN',
    listingLimit: 0, // signup + business description only; no listings
    features: [
      'Business profile & description',
      'Discoverable on the platform',
      'Chat with clients',
      'No product/service listings',
    ],
  },
  {
    tier: 'PREMIUM' as const,
    name: 'Premium',
    priceMonthly: 32000,
    priceYearly: 320000,
    currency: 'NGN',
    listingLimit: 5,
    features: [
      'Up to 5 listings (products/services/rentals)',
      'Customisable storefront',
      'Priority search ranking',
      'Analytics dashboard',
    ],
  },
  {
    tier: 'GOLD' as const,
    name: 'Gold',
    priceMonthly: 80000,
    priceYearly: 800000,
    currency: 'NGN',
    listingLimit: null, // unlimited
    features: [
      'Everything in Premium',
      'Unlimited listings',
      'Highest search ranking + ads',
      'In-app voice calling',
      'Dedicated success manager',
    ],
  },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder },
      create: { ...cat, isActive: true },
    });
  }
  console.log(`  ✓ ${CATEGORIES.length} categories`);

  console.log('Seeding Nigeria...');
  const nigeria = await prisma.country.upsert({
    where: { code: NIGERIA.code },
    update: NIGERIA,
    create: { ...NIGERIA, isActive: true },
  });

  for (const city of NIGERIAN_CITIES) {
    await prisma.city.upsert({
      where: { countryId_name: { countryId: nigeria.id, name: city.name } },
      update: { state: city.state, latitude: city.latitude, longitude: city.longitude },
      create: { ...city, countryId: nigeria.id, isActive: true },
    });
  }
  console.log(`  ✓ ${NIGERIAN_CITIES.length} cities`);

  console.log('Seeding subscription plans...');
  for (const plan of SUBSCRIPTION_PLANS) {
    const data = {
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      currency: plan.currency,
      listingLimit: plan.listingLimit,
      features: plan.features,
    };
    await (prisma as any).subscriptionPlan.upsert({
      where: { tier: plan.tier },
      update: data,
      create: { tier: plan.tier, ...data },
    });
  }
  console.log(`  ✓ ${SUBSCRIPTION_PLANS.length} subscription plans`);

  // Commission config intentionally not seeded — subscription-only model (4 June MoM).

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
