import React, { useState } from 'react';
import { CroAnalysisResult, CroCheckItem, CRO_CATEGORIES } from '../types/cro';

interface Props {
  analysis: CroAnalysisResult | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onApplyFix?: (item: CroCheckItem) => void;
}

const CroChecklistPanel: React.FC<Props> = ({
  analysis,
  isAnalyzing,
  onAnalyze,
  onApplyFix,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getStatusIcon = (status: CroCheckItem['status']) => {
    switch (status) {
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      case 'warning':
        return '⚠️';
    }
  };

  const getStatusColor = (status: CroCheckItem['status']) => {
    switch (status) {
      case 'passed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
    }
  };

  const getImpactBadge = (impact: CroCheckItem['impact']) => {
    const colors = {
      high: 'bg-red-600 text-white',
      medium: 'bg-yellow-600 text-white',
      low: 'bg-blue-600 text-white',
    };
    const labels = {
      high: '높음',
      medium: '중간',
      low: '낮음',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[impact]}`}>
        {labels[impact]}
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const filteredItems = analysis?.items.filter(
    (item) => !selectedCategory || item.category === selectedCategory
  );

  const categoryStats = CRO_CATEGORIES.map((cat) => {
    const categoryItems = analysis?.items.filter((item) => item.category === cat.id) || [];
    const passed = categoryItems.filter((item) => item.status === 'passed').length;
    const total = categoryItems.length;
    return {
      ...cat,
      passed,
      total,
      percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
    };
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">🎯 CRO 체크리스트</h3>
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 rounded-md hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? '분석 중...' : '🔍 CRO 분석'}
          </button>
        </div>

        {analysis && (
          <div className="grid grid-cols-2 gap-3">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">전체 점수</div>
              <div className="flex items-baseline gap-2">
                <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </div>
                <div className="text-sm text-gray-400">/ 100</div>
                <div className={`ml-auto text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                  {getScoreGrade(analysis.score)}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-2">검사 항목</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-green-400">✅ 통과:</span>
                  <span className="font-bold text-green-400">{analysis.passedChecks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400">⚠️ 경고:</span>
                  <span className="font-bold text-yellow-400">{analysis.warningChecks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">❌ 실패:</span>
                  <span className="font-bold text-red-400">{analysis.failedChecks}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!analysis && !isAnalyzing && (
          <div className="text-center text-gray-500 py-4 text-sm">
            CRO 분석을 시작하려면 버튼을 클릭하세요
          </div>
        )}
      </div>

      {/* Category Filters */}
      {analysis && (
        <div className="p-3 border-b border-gray-700 bg-gray-800/50">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              전체 ({analysis.items.length})
            </button>
            {categoryStats.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={cat.description}
              >
                {cat.icon} {cat.name} ({cat.passed}/{cat.total})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Checklist Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {isAnalyzing && (
          <div className="text-center text-gray-400 py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto mb-3"></div>
            <p>CRO 요소를 분석하고 있습니다...</p>
          </div>
        )}

        {!isAnalyzing && !analysis && (
          <div className="text-center text-gray-500 py-12">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-sm mb-2">전환율 최적화 체크리스트</p>
            <p className="text-xs text-gray-600">
              페이지의 CRO 요소를 자동으로 분석하고
              <br />
              개선 사항을 제안합니다
            </p>
          </div>
        )}

        {!isAnalyzing && analysis && filteredItems && (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const category = CRO_CATEGORIES.find((cat) => cat.id === item.category);
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border transition-all ${
                    item.status === 'passed'
                      ? 'bg-green-900/10 border-green-500/30'
                      : item.status === 'warning'
                      ? 'bg-yellow-900/10 border-yellow-500/30'
                      : 'bg-red-900/10 border-red-500/30'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="text-xl">{getStatusIcon(item.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold text-sm ${getStatusColor(item.status)}`}>
                            {item.title}
                          </h4>
                          {getImpactBadge(item.impact)}
                        </div>
                        <p className="text-xs text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {category?.icon} {category?.name}
                    </div>
                  </div>

                  {/* Fix Suggestion */}
                  {item.status !== 'passed' && item.fixSuggestion && (
                    <div className="mt-3 p-3 bg-gray-900/50 rounded-md border border-gray-700">
                      <div className="text-xs font-semibold text-blue-400 mb-1">💡 개선 방법:</div>
                      <div className="text-xs text-gray-300 mb-2">{item.fixSuggestion}</div>
                      {item.autoFixable && onApplyFix && (
                        <button
                          onClick={() => onApplyFix(item)}
                          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          ⚡ 자동 수정 적용
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Tips */}
      {analysis && (
        <div className="p-3 border-t border-gray-700 bg-gray-900">
          <div className="text-xs text-gray-400">
            <div className="font-semibold mb-1">💡 TIP:</div>
            {analysis.score >= 80 ? (
              <p>훌륭합니다! 전환율 최적화가 잘 되어있습니다. 🎉</p>
            ) : analysis.score >= 60 ? (
              <p>좋은 시작입니다. 실패 항목을 개선하면 더 높은 전환율을 달성할 수 있습니다.</p>
            ) : (
              <p>
                개선이 필요합니다. '높음' 영향도의 실패 항목부터 우선적으로 개선하세요.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CroChecklistPanel;
