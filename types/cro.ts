/**
 * Types for Conversion Rate Optimization (CRO) checklist
 */

export type CroCheckStatus = 'passed' | 'failed' | 'warning';

export interface CroCheckItem {
  id: string;
  category: 'urgency' | 'trust' | 'clarity' | 'cta' | 'visual' | 'mobile';
  title: string;
  description: string;
  status: CroCheckStatus;
  impact: 'high' | 'medium' | 'low';
  fixSuggestion?: string;
  autoFixable: boolean;
}

export interface CroAnalysisResult {
  score: number; // 0-100
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  items: CroCheckItem[];
  timestamp: Date;
}

export interface CroCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const CRO_CATEGORIES: CroCategory[] = [
  {
    id: 'urgency',
    name: '긴급성/희소성',
    icon: '⏰',
    description: '구매 긴급성을 높이는 요소',
  },
  {
    id: 'trust',
    name: '신뢰/권위',
    icon: '🛡️',
    description: '신뢰를 구축하는 요소',
  },
  {
    id: 'clarity',
    name: '명확성',
    icon: '💡',
    description: '제품/서비스 이해도',
  },
  {
    id: 'cta',
    name: 'CTA 최적화',
    icon: '🎯',
    description: '행동 유도 버튼',
  },
  {
    id: 'visual',
    name: '비주얼',
    icon: '🎨',
    description: '시각적 요소',
  },
  {
    id: 'mobile',
    name: '모바일 최적화',
    icon: '📱',
    description: '모바일 환경 최적화',
  },
];
