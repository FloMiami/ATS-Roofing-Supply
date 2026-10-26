import shinglesImage from '../../images/architectural-shingles.jpg';
import sealantImage from '../../images/roof-sealant.jpg';
import underlaymentImage from '../../images/underlayment-roll.jpg';
import johnImage from '../../images/team1.jpg';
import sarahImage from '../../images/team2.jpg';
import carlosImage from '../../images/team3.jpg';

// These are the marketing cards; the quote form loads the live catalog from Supabase instead.
export const products = [
  {
    name: 'Architectural Shingles',
    image: shinglesImage,
    imageAlt: 'Architectural Shingles',
    featuredDescription: 'Durable, weather-resistant shingles in a range of styles and colors.',
    description: 'Premium weather-resistant asphalt shingles with a bold, dimensional look.',
  },
  {
    name: 'Industrial Roof Sealant',
    image: sealantImage,
    imageAlt: 'Roof Sealant',
    description: 'Waterproof protection for flashing, vents, and seams. Easy application.',
  },
  {
    name: 'Synthetic Underlayment',
    image: underlaymentImage,
    imageAlt: 'Synthetic Underlayment',
    description: 'Lightweight, slip-resistant material for extra waterproofing under shingles.',
  },
];

// Keep the team details in one list so AboutPage can render one card per person.
export const teamMembers = [
  { name: 'John Doe', role: 'Founder & CEO', image: johnImage },
  { name: 'Sarah Smith', role: 'Operations Manager', image: sarahImage },
  { name: 'Carlos Rivera', role: 'Product Specialist', image: carlosImage },
];