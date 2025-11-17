export interface MoodPreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  prompt: string;
  category: 'luxury' | 'natural' | 'modern' | 'vintage' | 'lifestyle';
}

export const MOOD_PRESETS: Record<string, MoodPreset> = {
  minimalLuxury: {
    id: 'minimalLuxury',
    label: '미니멀 럭셔리',
    icon: '💎',
    description: '대리석, 부드러운 조명, 고급스러움',
    category: 'luxury',
    prompt: 'Minimalist luxury setting with white marble surface, soft diffused lighting from the side, clean and elegant composition, subtle shadows, premium feel, muted color palette with whites and grays, professional studio quality',
  },
  naturalWood: {
    id: 'naturalWood',
    label: '내추럴 우드',
    icon: '🌿',
    description: '나무 테이블, 자연광',
    category: 'natural',
    prompt: 'Natural wooden table setting, warm sunlight streaming through window, organic and earthy feel, soft shadows, natural grain texture visible, warm brown tones, plants or greenery in soft focus background, cozy atmosphere',
  },
  vintageRetro: {
    id: 'vintageRetro',
    label: '빈티지 감성',
    icon: '📻',
    description: '레트로, 따뜻한 색감',
    category: 'vintage',
    prompt: 'Vintage retro aesthetic, warm orange and brown color tones, nostalgic atmosphere, film photography look, soft grain texture, antique props in background, warm golden hour lighting, 70s-80s inspired styling',
  },
  modernWhite: {
    id: 'modernWhite',
    label: '모던 화이트',
    icon: '⚪',
    description: '깔끔한 흰색 배경, 미니멀',
    category: 'modern',
    prompt: 'Modern clean white background, pure and simple composition, bright even lighting, no shadows, minimal styling, contemporary feel, crisp and clear, professional e-commerce photography style',
  },
  cozyHome: {
    id: 'cozyHome',
    label: '코지 홈',
    icon: '🏠',
    description: '아늑한 집, 따뜻한 분위기',
    category: 'lifestyle',
    prompt: 'Cozy home interior setting, warm ambient lighting, comfortable and inviting atmosphere, soft textiles like blankets or cushions in background, lived-in feel, warm color temperature, hygge aesthetic',
  },
  luxuryGold: {
    id: 'luxuryGold',
    label: '럭셔리 골드',
    icon: '✨',
    description: '황금빛, 프리미엄 고급',
    category: 'luxury',
    prompt: 'Luxury premium setting with gold accents, rich and opulent atmosphere, dramatic lighting with highlights and shadows, elegant composition, black or deep navy background, metallic gold reflections, high-end product photography style',
  },
  cozyCafe: {
    id: 'cozyCafe',
    label: '코지 카페',
    icon: '☕',
    description: '카페 분위기, 브런치',
    category: 'lifestyle',
    prompt: 'Cozy cafe atmosphere, warm coffee shop lighting, wooden cafe table, soft background with cafe elements like coffee cups or pastries softly blurred, natural window light, Instagram-worthy brunch aesthetic, inviting and casual',
  },
  modernDark: {
    id: 'modernDark',
    label: '모던 다크',
    icon: '🌙',
    description: '어두운 배경, 세련됨',
    category: 'modern',
    prompt: 'Modern dark moody setting, black or charcoal gray background, dramatic side lighting creating strong highlights and shadows, sophisticated and elegant, contemporary minimalist style, high contrast, professional and sleek',
  },
  freshGreen: {
    id: 'freshGreen',
    label: '프레시 그린',
    icon: '🌱',
    description: '신선한 녹색, 자연',
    category: 'natural',
    prompt: 'Fresh green natural setting, vibrant green plants and leaves, bright and airy atmosphere, natural daylight, organic and healthy feel, botanical elements, clean and refreshing, spring-like energy',
  },
  elegantPink: {
    id: 'elegantPink',
    label: '엘레강트 핑크',
    icon: '🌸',
    description: '우아한 핑크, 여성스러움',
    category: 'luxury',
    prompt: 'Elegant pink aesthetic, soft blush pink tones, feminine and delicate feel, romantic atmosphere, silk or satin textures, soft diffused lighting, refined and graceful composition, beauty and cosmetics photography style',
  },
  industrialConcrete: {
    id: 'industrialConcrete',
    label: '인더스트리얼',
    icon: '🏭',
    description: '콘크리트, 도시적',
    category: 'modern',
    prompt: 'Industrial urban setting, concrete or cement texture background, raw and edgy aesthetic, cool gray tones, modern metropolitan feel, architectural elements, strong geometric composition, contemporary urban lifestyle',
  },
  beachSummer: {
    id: 'beachSummer',
    label: '비치 썸머',
    icon: '🏖️',
    description: '해변, 여름 분위기',
    category: 'lifestyle',
    prompt: 'Beach summer vibe, bright sunny atmosphere, light blue and sandy beige colors, tropical vacation feel, airy and light composition, summer lifestyle aesthetic, refreshing and energetic, outdoor beach setting elements',
  },
} as const;

export type MoodPresetKey = keyof typeof MOOD_PRESETS;

// Group presets by category for UI
export const MOOD_PRESETS_BY_CATEGORY = {
  luxury: ['minimalLuxury', 'luxuryGold', 'elegantPink'],
  natural: ['naturalWood', 'freshGreen'],
  modern: ['modernWhite', 'modernDark', 'industrialConcrete'],
  vintage: ['vintageRetro'],
  lifestyle: ['cozyHome', 'cozyCafe', 'beachSummer'],
} as const;
