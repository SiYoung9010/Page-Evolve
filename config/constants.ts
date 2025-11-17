// Application Configuration Constants

export const CONFIG = {
  // History Management
  HISTORY: {
    MAX_LENGTH: 20,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  },

  // Storage Limits
  STORAGE: {
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    IMAGE_STORAGE_KEY: 'page-evolve-images',
    PROJECTS_KEY: 'pageEvolve-recentProjects',
    EDITOR_STATE_KEY: 'pageEvolve-showEditor',
  },

  // Image Processing
  IMAGE: {
    MAX_FILE_SIZE_MB: 10,
    MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
    SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },

  // Export Settings
  EXPORT: {
    MAX_SLICE_HEIGHT: 5000,
    CANVAS_SCALE: 2,
    DEFAULT_IMAGE_QUALITY: 0.95,
    SLICE_DOWNLOAD_DELAY: 300, // ms between downloads
  },

  // AI Settings
  AI: {
    MAX_SUGGESTIONS: 5,
    DEFAULT_MODEL: 'gemini-2.5-flash',
    TEMPERATURE: 0.5,
  },

  // SEO Analysis
  SEO: {
    KEYWORD_DENSITY: {
      MIN: 2,
      MAX: 3,
    },
    TITLE: {
      MIN_LENGTH: 30,
      MAX_LENGTH: 60,
    },
    META_DESCRIPTION: {
      MIN_LENGTH: 120,
      MAX_LENGTH: 160,
    },
    CONTENT: {
      MIN_WORDS: 100,
      OPTIMAL_MIN_WORDS: 300,
      MAX_WORDS: 2000,
    },
  },

  // UI
  UI: {
    RECENT_PROJECTS_LIMIT: 10,
    DEBOUNCE_DELAY: 300,
  },
} as const;

// Sample HTML for new projects
export const SAMPLE_HTML_INPUT = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>프리미엄 세럼</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; background-color: #f9f9f9; color: #333; }
    .container { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    h1, h2 { color: #5a29e4; }
    h1 { font-size: 2.5em; text-align: center; margin-bottom: 20px;}
    h2 { border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; margin-top: 30px;}
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }
    p { line-height: 1.6; }
    b { color: #5a29e4; font-weight: 600; }
    ul { list-style-type: '✨'; padding-left: 20px; }
    li { margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>프리미엄 세럼 - 24시간 보습 지속</h1>
    <img src="https://picsum.photos/800/500" alt="세럼 제품 이미지">
    <h2>제품 설명</h2>
    <p>피부에 좋은 제품입니다. <b>이 프리미엄 세럼은</b> 보습 효과가 뛰어납니다.</p>
    <h2>특징</h2>
    <ul>
      <li>24시간 보습 지속</li>
      <li>피부과 테스트 완료</li>
      <li>무향, 무알코올</li>
    </ul>
  </div>
</body>
</html>`;
