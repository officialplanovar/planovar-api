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

// Global country list (ISO 3166-1 alpha-2 + E.164 dial code). Planovar is a
// global platform, so every country is selectable. The `Country` model has no
// currency column, so currency is not stored here; the flag emoji is derived
// from the ISO code at seed time (see flagOf) rather than hand-listed.
const COUNTRIES: Array<{ name: string; code: string; dialCode: string }> = [
  { name: 'Afghanistan', code: 'AF', dialCode: '+93' },
  { name: 'Albania', code: 'AL', dialCode: '+355' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213' },
  { name: 'Andorra', code: 'AD', dialCode: '+376' },
  { name: 'Angola', code: 'AO', dialCode: '+244' },
  { name: 'Antigua and Barbuda', code: 'AG', dialCode: '+1268' },
  { name: 'Argentina', code: 'AR', dialCode: '+54' },
  { name: 'Armenia', code: 'AM', dialCode: '+374' },
  { name: 'Australia', code: 'AU', dialCode: '+61' },
  { name: 'Austria', code: 'AT', dialCode: '+43' },
  { name: 'Azerbaijan', code: 'AZ', dialCode: '+994' },
  { name: 'Bahamas', code: 'BS', dialCode: '+1242' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973' },
  { name: 'Bangladesh', code: 'BD', dialCode: '+880' },
  { name: 'Barbados', code: 'BB', dialCode: '+1246' },
  { name: 'Belarus', code: 'BY', dialCode: '+375' },
  { name: 'Belgium', code: 'BE', dialCode: '+32' },
  { name: 'Belize', code: 'BZ', dialCode: '+501' },
  { name: 'Benin', code: 'BJ', dialCode: '+229' },
  { name: 'Bhutan', code: 'BT', dialCode: '+975' },
  { name: 'Bolivia', code: 'BO', dialCode: '+591' },
  { name: 'Bosnia and Herzegovina', code: 'BA', dialCode: '+387' },
  { name: 'Botswana', code: 'BW', dialCode: '+267' },
  { name: 'Brazil', code: 'BR', dialCode: '+55' },
  { name: 'Brunei', code: 'BN', dialCode: '+673' },
  { name: 'Bulgaria', code: 'BG', dialCode: '+359' },
  { name: 'Burkina Faso', code: 'BF', dialCode: '+226' },
  { name: 'Burundi', code: 'BI', dialCode: '+257' },
  { name: 'Cabo Verde', code: 'CV', dialCode: '+238' },
  { name: 'Cambodia', code: 'KH', dialCode: '+855' },
  { name: 'Cameroon', code: 'CM', dialCode: '+237' },
  { name: 'Canada', code: 'CA', dialCode: '+1' },
  { name: 'Central African Republic', code: 'CF', dialCode: '+236' },
  { name: 'Chad', code: 'TD', dialCode: '+235' },
  { name: 'Chile', code: 'CL', dialCode: '+56' },
  { name: 'China', code: 'CN', dialCode: '+86' },
  { name: 'Colombia', code: 'CO', dialCode: '+57' },
  { name: 'Comoros', code: 'KM', dialCode: '+269' },
  { name: 'Congo (Brazzaville)', code: 'CG', dialCode: '+242' },
  { name: 'Congo (Kinshasa)', code: 'CD', dialCode: '+243' },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506' },
  { name: "Côte d'Ivoire", code: 'CI', dialCode: '+225' },
  { name: 'Croatia', code: 'HR', dialCode: '+385' },
  { name: 'Cuba', code: 'CU', dialCode: '+53' },
  { name: 'Cyprus', code: 'CY', dialCode: '+357' },
  { name: 'Czechia', code: 'CZ', dialCode: '+420' },
  { name: 'Denmark', code: 'DK', dialCode: '+45' },
  { name: 'Djibouti', code: 'DJ', dialCode: '+253' },
  { name: 'Dominica', code: 'DM', dialCode: '+1767' },
  { name: 'Dominican Republic', code: 'DO', dialCode: '+1809' },
  { name: 'Ecuador', code: 'EC', dialCode: '+593' },
  { name: 'Egypt', code: 'EG', dialCode: '+20' },
  { name: 'El Salvador', code: 'SV', dialCode: '+503' },
  { name: 'Equatorial Guinea', code: 'GQ', dialCode: '+240' },
  { name: 'Eritrea', code: 'ER', dialCode: '+291' },
  { name: 'Estonia', code: 'EE', dialCode: '+372' },
  { name: 'Eswatini', code: 'SZ', dialCode: '+268' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251' },
  { name: 'Fiji', code: 'FJ', dialCode: '+679' },
  { name: 'Finland', code: 'FI', dialCode: '+358' },
  { name: 'France', code: 'FR', dialCode: '+33' },
  { name: 'Gabon', code: 'GA', dialCode: '+241' },
  { name: 'Gambia', code: 'GM', dialCode: '+220' },
  { name: 'Georgia', code: 'GE', dialCode: '+995' },
  { name: 'Germany', code: 'DE', dialCode: '+49' },
  { name: 'Ghana', code: 'GH', dialCode: '+233' },
  { name: 'Greece', code: 'GR', dialCode: '+30' },
  { name: 'Grenada', code: 'GD', dialCode: '+1473' },
  { name: 'Guatemala', code: 'GT', dialCode: '+502' },
  { name: 'Guinea', code: 'GN', dialCode: '+224' },
  { name: 'Guinea-Bissau', code: 'GW', dialCode: '+245' },
  { name: 'Guyana', code: 'GY', dialCode: '+592' },
  { name: 'Haiti', code: 'HT', dialCode: '+509' },
  { name: 'Honduras', code: 'HN', dialCode: '+504' },
  { name: 'Hungary', code: 'HU', dialCode: '+36' },
  { name: 'Iceland', code: 'IS', dialCode: '+354' },
  { name: 'India', code: 'IN', dialCode: '+91' },
  { name: 'Indonesia', code: 'ID', dialCode: '+62' },
  { name: 'Iran', code: 'IR', dialCode: '+98' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964' },
  { name: 'Ireland', code: 'IE', dialCode: '+353' },
  { name: 'Israel', code: 'IL', dialCode: '+972' },
  { name: 'Italy', code: 'IT', dialCode: '+39' },
  { name: 'Jamaica', code: 'JM', dialCode: '+1876' },
  { name: 'Japan', code: 'JP', dialCode: '+81' },
  { name: 'Jordan', code: 'JO', dialCode: '+962' },
  { name: 'Kazakhstan', code: 'KZ', dialCode: '+7' },
  { name: 'Kenya', code: 'KE', dialCode: '+254' },
  { name: 'Kiribati', code: 'KI', dialCode: '+686' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965' },
  { name: 'Kyrgyzstan', code: 'KG', dialCode: '+996' },
  { name: 'Laos', code: 'LA', dialCode: '+856' },
  { name: 'Latvia', code: 'LV', dialCode: '+371' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961' },
  { name: 'Lesotho', code: 'LS', dialCode: '+266' },
  { name: 'Liberia', code: 'LR', dialCode: '+231' },
  { name: 'Libya', code: 'LY', dialCode: '+218' },
  { name: 'Liechtenstein', code: 'LI', dialCode: '+423' },
  { name: 'Lithuania', code: 'LT', dialCode: '+370' },
  { name: 'Luxembourg', code: 'LU', dialCode: '+352' },
  { name: 'Madagascar', code: 'MG', dialCode: '+261' },
  { name: 'Malawi', code: 'MW', dialCode: '+265' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60' },
  { name: 'Maldives', code: 'MV', dialCode: '+960' },
  { name: 'Mali', code: 'ML', dialCode: '+223' },
  { name: 'Malta', code: 'MT', dialCode: '+356' },
  { name: 'Marshall Islands', code: 'MH', dialCode: '+692' },
  { name: 'Mauritania', code: 'MR', dialCode: '+222' },
  { name: 'Mauritius', code: 'MU', dialCode: '+230' },
  { name: 'Mexico', code: 'MX', dialCode: '+52' },
  { name: 'Micronesia', code: 'FM', dialCode: '+691' },
  { name: 'Moldova', code: 'MD', dialCode: '+373' },
  { name: 'Monaco', code: 'MC', dialCode: '+377' },
  { name: 'Mongolia', code: 'MN', dialCode: '+976' },
  { name: 'Montenegro', code: 'ME', dialCode: '+382' },
  { name: 'Morocco', code: 'MA', dialCode: '+212' },
  { name: 'Mozambique', code: 'MZ', dialCode: '+258' },
  { name: 'Myanmar', code: 'MM', dialCode: '+95' },
  { name: 'Namibia', code: 'NA', dialCode: '+264' },
  { name: 'Nauru', code: 'NR', dialCode: '+674' },
  { name: 'Nepal', code: 'NP', dialCode: '+977' },
  { name: 'Netherlands', code: 'NL', dialCode: '+31' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64' },
  { name: 'Nicaragua', code: 'NI', dialCode: '+505' },
  { name: 'Niger', code: 'NE', dialCode: '+227' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234' },
  { name: 'North Korea', code: 'KP', dialCode: '+850' },
  { name: 'North Macedonia', code: 'MK', dialCode: '+389' },
  { name: 'Norway', code: 'NO', dialCode: '+47' },
  { name: 'Oman', code: 'OM', dialCode: '+968' },
  { name: 'Pakistan', code: 'PK', dialCode: '+92' },
  { name: 'Palau', code: 'PW', dialCode: '+680' },
  { name: 'Palestine', code: 'PS', dialCode: '+970' },
  { name: 'Panama', code: 'PA', dialCode: '+507' },
  { name: 'Papua New Guinea', code: 'PG', dialCode: '+675' },
  { name: 'Paraguay', code: 'PY', dialCode: '+595' },
  { name: 'Peru', code: 'PE', dialCode: '+51' },
  { name: 'Philippines', code: 'PH', dialCode: '+63' },
  { name: 'Poland', code: 'PL', dialCode: '+48' },
  { name: 'Portugal', code: 'PT', dialCode: '+351' },
  { name: 'Qatar', code: 'QA', dialCode: '+974' },
  { name: 'Romania', code: 'RO', dialCode: '+40' },
  { name: 'Russia', code: 'RU', dialCode: '+7' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250' },
  { name: 'Saint Kitts and Nevis', code: 'KN', dialCode: '+1869' },
  { name: 'Saint Lucia', code: 'LC', dialCode: '+1758' },
  { name: 'Saint Vincent and the Grenadines', code: 'VC', dialCode: '+1784' },
  { name: 'Samoa', code: 'WS', dialCode: '+685' },
  { name: 'San Marino', code: 'SM', dialCode: '+378' },
  { name: 'Sao Tome and Principe', code: 'ST', dialCode: '+239' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966' },
  { name: 'Senegal', code: 'SN', dialCode: '+221' },
  { name: 'Serbia', code: 'RS', dialCode: '+381' },
  { name: 'Seychelles', code: 'SC', dialCode: '+248' },
  { name: 'Sierra Leone', code: 'SL', dialCode: '+232' },
  { name: 'Singapore', code: 'SG', dialCode: '+65' },
  { name: 'Slovakia', code: 'SK', dialCode: '+421' },
  { name: 'Slovenia', code: 'SI', dialCode: '+386' },
  { name: 'Solomon Islands', code: 'SB', dialCode: '+677' },
  { name: 'Somalia', code: 'SO', dialCode: '+252' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27' },
  { name: 'South Korea', code: 'KR', dialCode: '+82' },
  { name: 'South Sudan', code: 'SS', dialCode: '+211' },
  { name: 'Spain', code: 'ES', dialCode: '+34' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94' },
  { name: 'Sudan', code: 'SD', dialCode: '+249' },
  { name: 'Suriname', code: 'SR', dialCode: '+597' },
  { name: 'Sweden', code: 'SE', dialCode: '+46' },
  { name: 'Switzerland', code: 'CH', dialCode: '+41' },
  { name: 'Syria', code: 'SY', dialCode: '+963' },
  { name: 'Taiwan', code: 'TW', dialCode: '+886' },
  { name: 'Tajikistan', code: 'TJ', dialCode: '+992' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255' },
  { name: 'Thailand', code: 'TH', dialCode: '+66' },
  { name: 'Timor-Leste', code: 'TL', dialCode: '+670' },
  { name: 'Togo', code: 'TG', dialCode: '+228' },
  { name: 'Tonga', code: 'TO', dialCode: '+676' },
  { name: 'Trinidad and Tobago', code: 'TT', dialCode: '+1868' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216' },
  { name: 'Turkey', code: 'TR', dialCode: '+90' },
  { name: 'Turkmenistan', code: 'TM', dialCode: '+993' },
  { name: 'Tuvalu', code: 'TV', dialCode: '+688' },
  { name: 'Uganda', code: 'UG', dialCode: '+256' },
  { name: 'Ukraine', code: 'UA', dialCode: '+380' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
  { name: 'United States', code: 'US', dialCode: '+1' },
  { name: 'Uruguay', code: 'UY', dialCode: '+598' },
  { name: 'Uzbekistan', code: 'UZ', dialCode: '+998' },
  { name: 'Vanuatu', code: 'VU', dialCode: '+678' },
  { name: 'Vatican City', code: 'VA', dialCode: '+379' },
  { name: 'Venezuela', code: 'VE', dialCode: '+58' },
  { name: 'Vietnam', code: 'VN', dialCode: '+84' },
  { name: 'Yemen', code: 'YE', dialCode: '+967' },
  { name: 'Zambia', code: 'ZM', dialCode: '+260' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263' },
];

/**
 * Derive the flag emoji from an ISO 3166-1 alpha-2 code by mapping each letter
 * to its Regional Indicator Symbol (U+1F1E6..U+1F1FF). Keeps the flag column
 * populated without hand-listing 195 emojis.
 */
function flagOf(code: string): string {
  const base = 0x1f1e6;
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(base + (c.charCodeAt(0) - 65)))
    .join('');
}

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

// USD pricing per MoM-00005 (#24). Global, USD-native platform; subscription-only
// model (no commission). Prices are stored directly in USD.
const SUBSCRIPTION_PLANS = [
  {
    tier: 'BASIC' as const,
    name: 'Basic',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'USD',
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
    priceMonthly: 19.99,
    priceYearly: 199.99,
    currency: 'USD',
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
    priceMonthly: 49.99,
    priceYearly: 499.99,
    currency: 'USD',
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

  console.log('Seeding countries...');
  for (const c of COUNTRIES) {
    const data = {
      name: c.name,
      code: c.code,
      dialCode: c.dialCode,
      flagEmoji: flagOf(c.code),
    };
    await prisma.country.upsert({
      where: { code: c.code },
      update: data,
      create: { ...data, isActive: true },
    });
  }
  console.log(`  ✓ ${COUNTRIES.length} countries`);

  // Nigerian cities are retained as-is (they become free-text in the apps; the
  // table is harmless to keep). They hang off the seeded Nigeria row.
  console.log('Seeding Nigerian cities...');
  const nigeria = await prisma.country.findUniqueOrThrow({ where: { code: 'NG' } });

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
