export interface SurveyData {
  name: string;
  jewelryType: string;
  occasion: string;
  recipient: string;
  priceRange: string;
  stylePreference: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  description: string;
}

export const SURVEY_OPTIONS = {
  jewelryType: [
    { value: 'ring', label: 'Ring' },
    { value: 'necklace', label: 'Necklace' },
    { value: 'bracelet', label: 'Bracelet' },
    { value: 'earrings', label: 'Earrings' },
    { value: 'watch', label: 'Watch' },
    { value: 'other', label: 'Other' },
  ],
  occasion: [
    { value: 'wedding', label: 'Wedding' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'gift', label: 'Gift' },
    { value: 'personal', label: 'Personal Use' },
  ],
  recipient: [
    { value: 'self', label: 'Myself' },
    { value: 'partner', label: 'Partner/Spouse' },
    { value: 'family', label: 'Family Member' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
  ],
  priceRange: [
    { value: 'under-500', label: 'Under $500' },
    { value: '500-2000', label: '$500 - $2,000' },
    { value: 'over-2000', label: '$2,000+' },
  ],
  stylePreference: [
    { value: 'classic', label: 'Classic & Timeless' },
    { value: 'modern', label: 'Modern & Contemporary' },
    { value: 'minimal', label: 'Minimal & Clean' },
    { value: 'luxury', label: 'Luxury & Statement' },
    { value: 'vintage', label: 'Vintage & Antique' },
  ],
};