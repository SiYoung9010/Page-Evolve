export const EDIT_PRESETS = {
  removeBackground: {
    prompt: "Remove the background completely, keeping only the main object with transparent background",
    label: "배경 제거",
    icon: "✂️",
  },
  whiteBg: {
    prompt: "Change the background to pure white (#FFFFFF), keep the main object",
    label: "흰색 배경",
    icon: "⬜",
  },
  blueBg: {
    prompt: "Change the background to solid bright blue, keep the main object",
    label: "파란색 배경",
    icon: "🔵",
  },
  addShadow: {
    prompt: "Add a natural drop shadow under the main object",
    label: "그림자 추가",
    icon: "🌑",
  },
  enlargeProduct: {
    prompt: "Make the main product/object 2x larger while maintaining quality",
    label: "제품 확대",
    icon: "🔍",
  },
  removeText: {
    prompt: "Remove any obvious watermarks or overlaid text from the image. Preserve text that is part of the original scene, like text on books or signs.",
    label: "텍스트 제거",
    icon: "🚫",
  },
  vintageFilter: {
    prompt: "Add a retro, vintage filter with warm tones",
    label: "빈티지 필터",
    icon: "📷",
  },
  dramatic: {
    prompt: "Add dramatic, cinematic lighting effect",
    label: "조명 효과",
    icon: "✨",
  },
} as const;

export type PresetKey = keyof typeof EDIT_PRESETS;
