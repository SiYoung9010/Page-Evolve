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

// Feedback templates for quick suggestions
export const FEEDBACK_TEMPLATES = [
  {
    id: 'add-urgency',
    title: '긴급성 추가',
    description: '한정 수량, 타이머 등으로 구매 긴급성 유발',
    example: '제품 설명 아래에 "재고 5개 남음" 배지를 추가해줘',
  },
  {
    id: 'add-reviews',
    title: '고객 리뷰 섹션',
    description: '사회적 증거를 위한 리뷰 영역 추가',
    example: '특징 섹션 아래에 고객 리뷰 3개를 추가해줘. 별점 5점, 실제 사용 후기 형식으로',
  },
  {
    id: 'improve-cta',
    title: 'CTA 버튼 강화',
    description: '구매 버튼을 더 눈에 띄게 개선',
    example: '제목 바로 아래에 크고 눈에 띄는 "지금 구매하기" 버튼을 추가해줘',
  },
  {
    id: 'add-benefits',
    title: '혜택 명확화',
    description: '제품 사용의 구체적 혜택 강조',
    example: '특징을 혜택 중심으로 바꿔줘. "24시간 보습" → "아침부터 저녁까지 촉촉한 피부 유지"',
  },
  {
    id: 'add-comparison',
    title: '전후 비교',
    description: '제품 사용 전후 비교 섹션',
    example: '제품 설명과 특징 사이에 "사용 전/후 비교" 섹션을 추가해줘',
  },
  {
    id: 'add-guarantee',
    title: '품질 보증',
    description: '환불 보증, 인증 마크 등 신뢰 요소',
    example: '페이지 하단에 "100% 환불 보증" 섹션을 추가해줘',
  },
  {
    id: 'add-ingredients',
    title: '성분 설명',
    description: '주요 성분과 효능 설명',
    example: '특징 아래에 주요 성분 3가지와 각 효능을 표 형식으로 추가해줘',
  },
  {
    id: 'improve-mobile',
    title: '모바일 최적화',
    description: '모바일 환경에서 더 잘 보이도록 개선',
    example: '제목과 이미지 크기를 모바일에서 더 잘 보이도록 조정해줘',
  },
] as const;
