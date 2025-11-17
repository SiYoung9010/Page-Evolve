import { CroAnalysisResult, CroCheckItem, CroCheckStatus } from '../types/cro';

/**
 * Analyzes HTML against e-commerce CRO best practices
 */
export const analyzeCro = (html: string): CroAnalysisResult => {
  const items: CroCheckItem[] = [];
  const htmlLower = html.toLowerCase();

  // ========== URGENCY/SCARCITY CHECKS ==========

  // Check for limited stock indicator
  const hasStockIndicator =
    /재고.*?\d+.*?남/.test(htmlLower) ||
    /stock.*?\d+.*?(left|remaining)/.test(htmlLower) ||
    /한정|limited|재고\s*부족/.test(htmlLower);
  items.push({
    id: 'stock-indicator',
    category: 'urgency',
    title: '재고 표시',
    description: '제한된 재고를 표시하여 긴급성 유도',
    status: hasStockIndicator ? 'passed' : 'failed',
    impact: 'high',
    fixSuggestion: '재고 카운트다운 표시 추가 (예: "재고 5개 남음")',
    autoFixable: true,
  });

  // Check for time-limited offer
  const hasTimeLimit =
    /\d+시간.*?특가|할인.*?종료|타임.*?세일|오늘만|today\s*only/.test(htmlLower);
  items.push({
    id: 'time-limit',
    category: 'urgency',
    title: '시간 제한 표시',
    description: '시간 제한 오퍼로 즉각 행동 유도',
    status: hasTimeLimit ? 'passed' : 'warning',
    impact: 'medium',
    fixSuggestion: '타임 카운트다운 또는 "오늘만" 배지 추가',
    autoFixable: true,
  });

  // ========== TRUST/AUTHORITY CHECKS ==========

  // Check for reviews/ratings
  const hasReviews =
    /리뷰|review|평점|rating|⭐|★/.test(htmlLower) &&
    /\d+(\.\d+)?\s*(\/\s*5|점|stars?)/.test(htmlLower);
  items.push({
    id: 'reviews',
    category: 'trust',
    title: '고객 리뷰',
    description: '실제 고객 리뷰로 신뢰도 향상',
    status: hasReviews ? 'passed' : 'failed',
    impact: 'high',
    fixSuggestion: '별점과 리뷰 개수 추가 (예: "⭐ 4.8 / 5.0 (2,847개 리뷰)")',
    autoFixable: true,
  });

  // Check for social proof
  const hasSocialProof =
    /\d+명.*?(구매|선택|사용)|bestseller|베스트셀러|\d+\s*sold/.test(htmlLower);
  items.push({
    id: 'social-proof',
    category: 'trust',
    title: '사회적 증거',
    description: '다수가 선택했다는 증거',
    status: hasSocialProof ? 'passed' : 'warning',
    impact: 'high',
    fixSuggestion: '"10,000명이 선택한" 또는 "이달의 베스트셀러" 배지 추가',
    autoFixable: true,
  });

  // Check for certifications/badges
  const hasBadges =
    /인증|certified|보장|guarantee|품질|quality|친환경|eco/.test(htmlLower) &&
    (/<span[^>]*badge/.test(htmlLower) || /badge/.test(htmlLower));
  items.push({
    id: 'trust-badges',
    category: 'trust',
    title: '신뢰 배지',
    description: '인증, 보장 등의 신뢰 표시',
    status: hasBadges ? 'passed' : 'warning',
    impact: 'medium',
    fixSuggestion: '품질 인증, 환불 보장 등의 배지 추가',
    autoFixable: true,
  });

  // Check for return policy
  const hasReturnPolicy =
    /반품|교환|환불|return|refund/.test(htmlLower);
  items.push({
    id: 'return-policy',
    category: 'trust',
    title: '반품 정책',
    description: '명확한 반품/환불 정책',
    status: hasReturnPolicy ? 'passed' : 'failed',
    impact: 'high',
    fixSuggestion: '반품 정책 섹션 추가 (예: "30일 무료 반품")',
    autoFixable: false,
  });

  // ========== CLARITY CHECKS ==========

  // Check for clear product name/title
  const hasProductTitle =
    /<h1[^>]*>/.test(htmlLower) || /<[^>]*product[_-]?title/.test(htmlLower);
  items.push({
    id: 'product-title',
    category: 'clarity',
    title: '명확한 제품명',
    description: 'H1 태그로 된 명확한 제품명',
    status: hasProductTitle ? 'passed' : 'failed',
    impact: 'high',
    fixSuggestion: '<h1> 태그로 제품명 강조',
    autoFixable: false,
  });

  // Check for product description
  const hasDescription =
    /description|설명|특징|feature/.test(htmlLower) &&
    html.length > 500;
  items.push({
    id: 'description',
    category: 'clarity',
    title: '제품 설명',
    description: '상세한 제품 설명',
    status: hasDescription ? 'passed' : 'failed',
    impact: 'high',
    fixSuggestion: '제품의 핵심 특징과 장점을 설명하는 섹션 추가',
    autoFixable: false,
  });

  // Check for specifications
  const hasSpecs =
    /스펙|사양|spec|제원|크기|무게|dimension/.test(htmlLower) &&
    (/<table/.test(htmlLower) || /<dl/.test(htmlLower) || /<ul/.test(htmlLower));
  items.push({
    id: 'specifications',
    category: 'clarity',
    title: '제품 스펙',
    description: '구조화된 제품 사양',
    status: hasSpecs ? 'passed' : 'warning',
    impact: 'medium',
    fixSuggestion: '테이블 형태의 상세 스펙 추가',
    autoFixable: true,
  });

  // ========== CTA CHECKS ==========

  // Check for primary CTA button
  const hasCtaButton =
    /구매|buy|purchase|cart|장바구니/.test(htmlLower) &&
    /<button/.test(htmlLower);
  items.push({
    id: 'cta-button',
    category: 'cta',
    title: 'CTA 버튼',
    description: '명확한 행동 유도 버튼',
    status: hasCtaButton ? 'passed' : 'failed',
    impact: 'high',
    fixSuggestion: '눈에 띄는 "지금 구매하기" 버튼 추가',
    autoFixable: true,
  });

  // Check for multiple CTA placements
  const ctaCount = (html.match(/구매|buy now|장바구니|add to cart/gi) || []).length;
  const hasMultipleCtaCount = ctaCount >= 2;
  items.push({
    id: 'multiple-ctas',
    category: 'cta',
    title: '다중 CTA 배치',
    description: '페이지 상단/하단 모두 CTA 배치',
    status: hasMultipleCtaCount ? 'passed' : 'warning',
    impact: 'medium',
    fixSuggestion: '페이지 하단에도 "지금 구매하기" 버튼 추가',
    autoFixable: true,
  });

  // Check for urgency in CTA text
  const hasUrgentCta =
    /지금|now|today|즉시|바로/.test(htmlLower) && hasCtaButton;
  items.push({
    id: 'urgent-cta',
    category: 'cta',
    title: '긴급성 있는 CTA 문구',
    description: 'CTA에 행동 촉구 단어 포함',
    status: hasUrgentCta ? 'passed' : 'warning',
    impact: 'medium',
    fixSuggestion: 'CTA 문구를 "지금 바로 구매하기"로 변경',
    autoFixable: true,
  });

  // ========== VISUAL CHECKS ==========

  // Check for product images
  const hasProductImage =
    /<img/.test(htmlLower) || /background.*?image/.test(htmlLower);
  items.push({
    id: 'product-image',
    category: 'visual',
    title: '제품 이미지',
    description: '고품질 제품 이미지',
    status: hasProductImage ? 'passed' : 'failed',
    impact: 'high',
    fixSuggestion: '제품의 고화질 이미지 추가',
    autoFixable: false,
  });

  // Check for visual hierarchy (headings)
  const hasHeadings = /<h[1-6]/.test(htmlLower);
  const headingCount = (html.match(/<h[1-6]/gi) || []).length;
  items.push({
    id: 'visual-hierarchy',
    category: 'visual',
    title: '시각적 계층',
    description: '헤딩 태그로 구조화된 레이아웃',
    status: hasHeadings && headingCount >= 3 ? 'passed' : 'warning',
    impact: 'medium',
    fixSuggestion: 'H2, H3 태그로 섹션 구분',
    autoFixable: false,
  });

  // Check for contrasting colors/emphasis
  const hasEmphasis =
    /color:\s*(#?red|#?dc|#?f00|#dc2626|#ef4444)/.test(htmlLower) ||
    /background.*?(gradient|linear)/.test(htmlLower);
  items.push({
    id: 'color-contrast',
    category: 'visual',
    title: '색상 강조',
    description: '가격/할인율 등 강조 색상 사용',
    status: hasEmphasis ? 'passed' : 'warning',
    impact: 'low',
    fixSuggestion: '중요 정보에 대비되는 색상 사용',
    autoFixable: true,
  });

  // ========== MOBILE OPTIMIZATION CHECKS ==========

  // Check for viewport meta tag
  const hasViewport = /viewport/.test(htmlLower);
  items.push({
    id: 'viewport',
    category: 'mobile',
    title: 'Viewport 설정',
    description: '모바일 뷰포트 메타 태그',
    status: hasViewport ? 'passed' : 'failed',
    impact: 'high',
    fixSuggestion: '<meta name="viewport" content="width=device-width, initial-scale=1.0"> 추가',
    autoFixable: true,
  });

  // Check for responsive design indicators
  const hasResponsive =
    /media.*?query|@media/.test(htmlLower) ||
    /max-width|min-width/.test(htmlLower) ||
    /flex|grid/.test(htmlLower);
  items.push({
    id: 'responsive-design',
    category: 'mobile',
    title: '반응형 디자인',
    description: '미디어 쿼리 또는 Flexbox/Grid 사용',
    status: hasResponsive ? 'passed' : 'warning',
    impact: 'high',
    fixSuggestion: 'CSS Flexbox/Grid로 반응형 레이아웃 구현',
    autoFixable: false,
  });

  // Check for mobile-friendly button sizes
  const hasMobileFriendlyButtons =
    /padding.*?(3|4|5|6|7|8|9|10|1\.5|2|2\.5|3)/.test(htmlLower) &&
    hasCtaButton;
  items.push({
    id: 'mobile-buttons',
    category: 'mobile',
    title: '모바일 버튼 크기',
    description: '터치하기 쉬운 버튼 크기',
    status: hasMobileFriendlyButtons ? 'passed' : 'warning',
    impact: 'medium',
    fixSuggestion: '버튼 padding을 최소 12px 이상으로 설정',
    autoFixable: true,
  });

  // Calculate statistics
  const passedChecks = items.filter(item => item.status === 'passed').length;
  const failedChecks = items.filter(item => item.status === 'failed').length;
  const warningChecks = items.filter(item => item.status === 'warning').length;
  const totalChecks = items.length;

  // Calculate score (passed = 100%, warning = 50%, failed = 0%)
  const score = Math.round(
    ((passedChecks * 100 + warningChecks * 50) / totalChecks)
  );

  return {
    score,
    totalChecks,
    passedChecks,
    failedChecks,
    warningChecks,
    items,
    timestamp: new Date(),
  };
};
