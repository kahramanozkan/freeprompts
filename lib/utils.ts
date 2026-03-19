// Turkish to English character converter
const trToEn = (text: string): string => {
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  
  return text
    .split('')
    .map(char => trMap[char] || char)
    .join('');
};

// Create URL slug from title
export const createSlug = (title: string): string => {
  return trToEn(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Generate random username like user123456789
export const generateRandomUsername = (): string => {
  const randomNum = Math.floor(Math.random() * 900000000) + 100000000; // 9-digit number
  return `user${randomNum}`;
};