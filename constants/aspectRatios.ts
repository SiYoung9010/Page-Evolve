export interface AspectRatio {
  id: string;
  label: string;
  icon: string;
  ratio: string;
  width: number;
  height: number;
  platform: string;
  description: string;
}

export const ASPECT_RATIOS: Record<string, AspectRatio> = {
  square: {
    id: 'square',
    label: '1:1 정사각형',
    icon: '⬜',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    platform: 'Instagram Feed',
    description: '인스타그램 피드 정사각형',
  },
  portrait: {
    id: 'portrait',
    label: '4:5 세로',
    icon: '📱',
    ratio: '4:5',
    width: 1080,
    height: 1350,
    platform: 'Instagram Portrait',
    description: '인스타그램 세로 이미지',
  },
  story: {
    id: 'story',
    label: '9:16 스토리',
    icon: '📲',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    platform: 'Instagram/Facebook Story',
    description: '인스타그램/페이스북 스토리',
  },
  landscape: {
    id: 'landscape',
    label: '16:9 가로',
    icon: '🖥️',
    ratio: '16:9',
    width: 1920,
    height: 1080,
    platform: 'YouTube Thumbnail',
    description: '유튜브 썸네일, 가로 영상',
  },
  widescreen: {
    id: 'widescreen',
    label: '21:9 와이드',
    icon: '🎬',
    ratio: '21:9',
    width: 2560,
    height: 1080,
    platform: 'Banner/Cover',
    description: '배너, 커버 이미지',
  },
  pinterest: {
    id: 'pinterest',
    label: '2:3 핀터레스트',
    icon: '📍',
    ratio: '2:3',
    width: 1000,
    height: 1500,
    platform: 'Pinterest',
    description: '핀터레스트 최적화',
  },
} as const;

export type AspectRatioKey = keyof typeof ASPECT_RATIOS;
