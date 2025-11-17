// AI Prompt Templates

export const PROMPTS = {
  /**
   * HTML 분석 프롬프트
   */
  HTML_ANALYSIS: (html: string) => `
You are an expert marketing and web development consultant. Analyze the following product detail page HTML and provide suggestions for improvement based on the provided JSON schema.

HTML Code:
\`\`\`html
${html}
\`\`\`

Analysis Rules:
- Provide a maximum of 5 suggestions.
- Include 1-2 'high' priority suggestions.
- The 'message' should be concrete and explain the reasoning.
- The 'code' should be a valid HTML snippet.
- The 'targetSelector' should be a specific and valid CSS selector.
- The 'action' must be one of: 'replace', 'insert_before', 'insert_after', 'wrap'.
- Example: "❌ Add image" -> "✅ Add a before-and-after comparison image to build trust and potentially increase conversion rates by 15%."
`,

  /**
   * 사용자 피드백 적용 프롬프트
   */
  USER_FEEDBACK: (currentHtml: string, userFeedback: string) => `You are an expert frontend developer. The user has provided feedback on their product page. Apply their requested changes to the HTML and return the complete, updated HTML.

CRITICAL: Return ONLY the complete HTML. Do not include any explanations, markdown formatting (like \`\`\`html), or any text other than the HTML code itself.

User Feedback:
"${userFeedback}"

Current HTML:
\`\`\`html
${currentHtml}
\`\`\`
`,

  /**
   * 향상된 사용자 피드백 프롬프트 (구조화된 응답)
   */
  USER_FEEDBACK_ENHANCED: (currentHtml: string, userFeedback: string, context?: {
    previousChanges?: string[];
    pageGoal?: string;
  }) => `You are an expert e-commerce page developer. The user wants to modify their product detail page.

CONTEXT:
${context?.pageGoal ? `Page Goal: ${context.pageGoal}` : ''}
${context?.previousChanges && context.previousChanges.length > 0 ? `Previous Changes: ${context.previousChanges.join(', ')}` : ''}

USER REQUEST:
"${userFeedback}"

CURRENT HTML:
\`\`\`html
${currentHtml}
\`\`\`

INSTRUCTIONS:
1. Analyze the user's request carefully
2. Make the requested changes while preserving all existing styles and functionality
3. If the request is vague, make reasonable assumptions based on e-commerce best practices
4. Return ONLY the complete, updated HTML (no explanations, no markdown)
5. Ensure all changes are production-ready and maintain responsive design

CRITICAL: Return ONLY the HTML code. No preamble, no markdown fences, no explanations.
`,

  /**
   * 이미지 분석 프롬프트
   */
  IMAGE_ANALYSIS: (htmlStructure: string) => `
Analyze this image and suggest how to insert it into a product detail page HTML.

Current HTML Structure (simplified):
${htmlStructure}

Provide your response in JSON format according to the provided schema.
1.  **description**: Describe what is shown in the image in Korean (1 sentence).
2.  **altText**: Create an SEO-optimized alt text in Korean (max 50 characters).
3.  **altVariations**: Provide 3 alternative alt text options.
4.  **suggestedPositions**: Suggest 1-3 optimal positions to insert this image.

For each position:
-   **targetSelector**: A specific CSS selector of the target element.
-   **reason**: Explain why this position is effective in Korean.
-   **priority**: 'high', 'medium', or 'low'.
-   **code**: A complete <img> tag. Use 'PLACEHOLDER' for the src attribute.
-   **action**: 'replace', 'insert_before', or 'insert_after'.
`,

  /**
   * 피드백 템플릿 생성 프롬프트
   */
  FEEDBACK_TEMPLATE_SUGGESTION: (currentHtml: string) => `
Based on this product page HTML, suggest 5 common improvement templates that users might want to apply.

HTML:
\`\`\`html
${currentHtml}
\`\`\`

For each template, provide:
1. A short title (Korean, max 30 characters)
2. A description (Korean, 1 sentence)
3. Example feedback text that a user could use

Focus on:
- Adding social proof elements
- Improving call-to-action
- Enhancing product descriptions
- Adding trust signals
- Improving visual hierarchy
`,

  /**
   * 피드백 개선 제안 프롬프트
   */
  FEEDBACK_IMPROVEMENT_SUGGESTION: (vagueFeedback: string, currentHtml: string) => `
The user provided this feedback: "${vagueFeedback}"

This feedback is too vague. Based on the current HTML, suggest 3 specific, actionable improvements they might mean.

Current HTML:
\`\`\`html
${currentHtml}
\`\`\`

For each suggestion, provide:
1. Specific feedback text (Korean)
2. What it will change
3. Why it's beneficial

Return as JSON with structure: { suggestions: [{ feedback: string, changes: string, benefit: string }] }
`,
} as const;

// System Instructions for different AI tasks
export const SYSTEM_INSTRUCTIONS = {
  HTML_MODIFIER: 'You are an expert web developer specializing in e-commerce pages. Modify HTML based on user instructions and return only the complete, valid HTML code. Preserve all existing styles and scripts unless asked to change them.',

  CONTENT_WRITER: 'You are an expert e-commerce copywriter. Write compelling, conversion-focused content that builds trust and drives sales. Use Korean language naturally and professionally.',

  SEO_EXPERT: 'You are an SEO specialist focused on product pages. Provide actionable, data-driven suggestions that improve search rankings while maintaining user experience.',

  UX_ANALYST: 'You are a UX/UI expert specializing in conversion optimization. Analyze user flows and suggest improvements that reduce friction and increase conversions.',
} as const;

// Feedback templates for quick suggestions - E-commerce specialized
export const FEEDBACK_TEMPLATES = [
  // 전환율 최적화 (Conversion Optimization)
  {
    id: 'hero-optimization',
    title: '히어로 섹션 최적화',
    category: 'conversion',
    description: '첫 화면에 핵심 메시지와 CTA 강화',
    example: '상단에 대형 제품 이미지, "10,000명이 선택한" 문구, 크고 눈에 띄는 "지금 구매" 버튼 3개 배치해줘',
    impact: '+15-25% 전환율',
  },
  {
    id: 'price-emphasis',
    title: '가격 강조',
    category: 'conversion',
    description: '할인가를 명확하게 표시하여 구매 유도',
    example: '원가 89,000원에 취소선, 할인가 44,500원을 빨간색 크게, 옆에 "50% 할인" 배지 추가해줘',
    impact: '+10-15% 클릭률',
  },
  {
    id: 'stock-scarcity',
    title: '실시간 재고 표시',
    category: 'urgency',
    description: '재고 부족으로 긴급성 유발',
    example: '제품명 옆에 "⚠️ 재고 7개 남음" 빨간 배지를 추가해줘',
    impact: '+8-12% 즉시 구매율',
  },
  {
    id: 'countdown-timer',
    title: '카운트다운 타이머',
    category: 'urgency',
    description: '시간 제한으로 구매 결정 촉진',
    example: '상단에 "이 가격은 03:24:15 후 종료됩니다" 실시간 카운트다운 타이머 추가해줘',
    impact: '+15-20% 전환율',
  },
  {
    id: 'add-reviews',
    title: '고객 리뷰 섹션',
    category: 'trust',
    description: '사회적 증거를 위한 리뷰 영역 추가',
    example: '특징 섹션 아래에 별점 ⭐⭐⭐⭐⭐ 4.8 (1,247개 리뷰)와 실제 후기 3개를 카드 형식으로 추가해줘',
    impact: '+20-30% 신뢰도',
  },

  // 신뢰 구축 (Trust Building)
  {
    id: 'certifications',
    title: '인증마크 & 수상',
    category: 'trust',
    description: '공식 인증으로 신뢰도 향상',
    example: 'FDA 인증, ISO 9001, 2024 올해의 브랜드상 배지 3개를 하단에 한 줄로 배치해줘',
    impact: '+12-18% 신뢰도',
  },
  {
    id: 'real-reviews',
    title: '실제 사용 후기',
    category: 'trust',
    description: '진짜 고객 목소리로 신뢰 구축',
    example: '고객 3명의 실제 후기 + 별점 + 구매일자 + 프로필 사진을 카드 3개로 배치해줘',
    impact: '+25-35% 구매 결정',
  },
  {
    id: 'media-coverage',
    title: '언론 보도',
    category: 'trust',
    description: '언론 노출로 권위 확보',
    example: '"조선일보, 한국경제, MBC 등 5개 주요 언론사 보도" 섹션을 로고와 함께 추가해줘',
    impact: '+10-15% 브랜드 신뢰',
  },
  {
    id: 'expert-recommendation',
    title: '전문가 추천',
    category: 'trust',
    description: '전문가 의견으로 권위 부여',
    example: '피부과 전문의 추천 코멘트 + 프로필 사진 + 자격증을 박스로 추가해줘',
    impact: '+15-20% 신뢰도',
  },

  // 제품 상세 (Product Details)
  {
    id: 'ingredient-breakdown',
    title: '성분 상세 분석',
    category: 'details',
    description: '주요 성분과 효능 명확히 설명',
    example: '주요 성분 3가지(히알루론산, 비타민C, 콜라겐) + 각 효능 + 함량을 표 형식으로 추가해줘',
    impact: '+8-12% 이해도',
  },
  {
    id: 'how-to-use',
    title: '사용법 가이드',
    category: 'details',
    description: '스텝별 사용 방법 안내',
    example: '1.세안 → 2.토너 → 3.세럼 → 4.크림 순서로 이미지와 설명을 스텝 형식으로 추가해줘',
    impact: '+10% 사용 만족도',
  },
  {
    id: 'before-after',
    title: '전후 비교',
    category: 'details',
    description: '시각적 효과 증명',
    example: '사용 전/후 비교 이미지 2장을 나란히 배치하고 "2주 사용 결과" 텍스트 추가해줘',
    impact: '+20-30% 효과 신뢰',
  },
  {
    id: 'application-area',
    title: '적용 부위 안내',
    category: 'details',
    description: '제품 사용 부위 명확화',
    example: '얼굴 일러스트에 효과 있는 부위(이마, 볼, 턱)를 표시하고 각 부위별 효능 추가해줘',
    impact: '+5-8% 이해도',
  },

  // 구매 유도 (Purchase Incentives)
  {
    id: 'bundle-discount',
    title: '번들 할인 제안',
    category: 'upsell',
    description: '세트 구매로 객단가 증가',
    example: '"이 제품 + 크림 세트 구매 시 15,000원 할인" 제안 박스를 눈에 띄게 추가해줘',
    impact: '+20-40% 객단가',
  },
  {
    id: 'free-shipping',
    title: '무료배송 진행바',
    category: 'incentive',
    description: '목표 금액까지 얼마나 남았는지 표시',
    example: '"50,000원 이상 무료배송" 진행바 + 현재 장바구니 금액 + "X,XXX원 더 담으면 무료배송" 메시지 추가해줘',
    impact: '+15-25% 추가 구매',
  },
  {
    id: 'free-gift',
    title: '사은품 증정',
    category: 'incentive',
    description: '즉시 혜택으로 구매 유도',
    example: '"오늘 구매 시 미니 샘플 키트 증정 (19,000원 상당)" 빨간 박스로 강조해서 추가해줘',
    impact: '+12-18% 구매 결정',
  },
  {
    id: 'point-reward',
    title: '포인트 적립 안내',
    category: 'incentive',
    description: '재구매 유도 장치',
    example: '"구매 시 5% 포인트 적립 (2,225P 적립 예정)" 골드 색상으로 표시해줘',
    impact: '+5-10% 재구매율',
  },

  // 정보 제공 (Information)
  {
    id: 'faq-section',
    title: 'FAQ 섹션',
    category: 'info',
    description: '자주 묻는 질문으로 의문 해소',
    example: '자주 묻는 질문 5개(사용 방법, 알레르기 반응, 보관법, 유통기한, 반품)를 아코디언 형식으로 추가해줘',
    impact: '+10-15% 구매 완료율',
  },
  {
    id: 'delivery-return',
    title: '배송/반품 정책',
    category: 'info',
    description: '명확한 정책으로 불안 해소',
    example: '배송 기간(1-3일), 교환/반품 정책(7일 이내), 고객센터 정보를 표 형식으로 추가해줘',
    impact: '+8-12% 구매 완료율',
  },
  {
    id: 'product-specs',
    title: '제품 스펙 상세',
    category: 'info',
    description: '상세 스펙으로 정보 제공',
    example: '용량(50ml), 원산지(한국), 유통기한(2026.12), 전성분표를 깔끔한 테이블로 추가해줘',
    impact: '+5% 정보 만족도',
  },

  // 시각적 개선 (Visual Enhancement)
  {
    id: 'improve-cta',
    title: 'CTA 버튼 강화',
    category: 'visual',
    description: '구매 버튼을 더 눈에 띄게',
    example: '제목 바로 아래, 중간, 하단 3곳에 "지금 구매하기" 버튼을 크고 눈에 띄게 추가해줘. 버튼은 그라데이션 효과와 그림자 포함',
    impact: '+15-25% 클릭률',
  },
  {
    id: 'add-benefits',
    title: '혜택 명확화',
    category: 'visual',
    description: '기능이 아닌 혜택 중심으로',
    example: '특징을 혜택 중심으로 바꿔줘. "24시간 보습" → "아침 출근부터 저녁 퇴근까지 촉촉하게" 이런 식으로 3가지',
    impact: '+10-15% 공감도',
  },
  {
    id: 'add-guarantee',
    title: '품질 보증',
    category: 'visual',
    description: '환불 보증으로 리스크 제거',
    example: '페이지 하단에 "100% 만족 보증 - 30일 이내 무조건 환불" 섹션을 녹색 박스로 강조해서 추가해줘',
    impact: '+10-15% 구매 결정',
  },
  {
    id: 'improve-mobile',
    title: '모바일 최적화',
    category: 'visual',
    description: '모바일 환경 최적화',
    example: '제목 크기 1.5배 확대, 이미지 너비 100%, 버튼 높이 60px, 텍스트 16px 이상으로 모바일 최적화해줘',
    impact: '+20-30% 모바일 전환율',
  },

  // 비교 & 경쟁력 (Comparison)
  {
    id: 'comparison-table',
    title: '경쟁사 비교표',
    category: 'comparison',
    description: '우위를 시각적으로 증명',
    example: '우리 제품 vs 경쟁사 3종 비교 테이블(가격, 성분, 용량, 효과)을 추가하고 우리 제품 열은 녹색으로 강조해줘',
    impact: '+15-20% 구매 확신',
  },
  {
    id: 'value-proposition',
    title: '가치 제안 명확화',
    category: 'comparison',
    description: '왜 이 제품인지 명확히',
    example: '"왜 우리 제품인가?" 섹션에 3가지 이유(1.천연 성분, 2.피부과 테스트, 3.합리적 가격)를 아이콘과 함께 추가해줘',
    impact: '+12-18% 차별화 인식',
  },
] as const;
