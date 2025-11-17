// Product information types for e-commerce

export interface ProductInfo {
  // 기본 정보
  name: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;

  // 상세 정보
  description: string;
  features: string[];
  specifications: { key: string; value: string }[];

  // 이미지
  mainImage?: string;
  galleryImages: string[];

  // 신뢰 요소
  reviews: {
    rating: number;
    count: number;
    highlights: string[];
  };
  badges: ('bestseller' | 'new' | 'limited' | 'eco-friendly' | 'certified')[];

  // 구매 정보
  stock?: number;
  deliveryInfo: string;
  returnPolicy: string;

  // 추가 정보
  ingredients?: string[];
  howToUse?: string[];
  warnings?: string[];
}

export const DEFAULT_PRODUCT_INFO: ProductInfo = {
  name: '프리미엄 세럼',
  price: 44500,
  originalPrice: 89000,
  discountRate: 50,
  description: '피부에 깊은 영양을 공급하는 프리미엄 세럼입니다.',
  features: [
    '24시간 보습 지속',
    '피부과 테스트 완료',
    '무향, 무알코올',
  ],
  specifications: [
    { key: '용량', value: '50ml' },
    { key: '원산지', value: '한국' },
    { key: '유통기한', value: '2026.12' },
  ],
  galleryImages: [],
  reviews: {
    rating: 4.8,
    count: 1247,
    highlights: ['보습력 최고!', '피부가 촉촉해졌어요', '재구매 의사 100%'],
  },
  badges: ['bestseller', 'certified'],
  deliveryInfo: '1-3일 이내 배송',
  returnPolicy: '7일 이내 무료 교환/반품',
};
