import React, { useState } from 'react';
import { FEEDBACK_TEMPLATES } from '../config/prompts';
import { FeedbackHistoryItem } from '../contexts/FeedbackContext';

interface Props {
  feedback: string;
  onFeedbackChange: (text: string) => void;
  onSubmit: () => void;
  isApplying: boolean;
  error: string | null;
  feedbackHistory: FeedbackHistoryItem[];
  onClearHistory: () => void;
  onReapplyFeedback: (feedback: string) => void;
  aiSuggestions?: string[];
  onGenerateSuggestions?: () => void;
  isGeneratingSuggestions?: boolean;
}

const EnhancedFeedbackPanel: React.FC<Props> = ({
  feedback,
  onFeedbackChange,
  onSubmit,
  isApplying,
  error,
  feedbackHistory,
  onClearHistory,
  onReapplyFeedback,
  aiSuggestions = [],
  onGenerateSuggestions,
  isGeneratingSuggestions = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'input' | 'templates' | 'history'>('input');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleTemplateSelect = (templateId: string) => {
    const template = FEEDBACK_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      onFeedbackChange(template.example);
      setActiveSubTab('input');
    }
  };

  const handleHistoryItemClick = (item: FeedbackHistoryItem) => {
    onReapplyFeedback(item.feedback);
  };

  const renderCharCount = () => {
    const count = feedback.length;
    const limit = 1000;
    const isNearLimit = count > limit * 0.8;
    const isOverLimit = count > limit;

    return (
      <div className={`text-xs ${isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-gray-500'}`}>
        {count} / {limit}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="flex border-b border-gray-700 shrink-0">
        <button
          onClick={() => setActiveSubTab('input')}
          className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
            activeSubTab === 'input'
              ? 'bg-gray-900 text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:bg-gray-700'
          }`}
        >
          ✍️ 피드백 입력
        </button>
        <button
          onClick={() => setActiveSubTab('templates')}
          className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
            activeSubTab === 'templates'
              ? 'bg-gray-900 text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:bg-gray-700'
          }`}
        >
          📋 템플릿 ({FEEDBACK_TEMPLATES.length})
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
            activeSubTab === 'history'
              ? 'bg-gray-900 text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:bg-gray-700'
          }`}
        >
          🕒 히스토리 ({feedbackHistory.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {activeSubTab === 'input' && (
          <div className="flex flex-col h-full">
            <div className="mb-2">
              <label htmlFor="feedback-textarea" className="text-sm font-semibold text-gray-300 block mb-1">
                원하는 변경사항을 설명해주세요
              </label>
              <p className="text-xs text-gray-500">
                구체적일수록 AI가 정확하게 수정합니다
              </p>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="mb-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <div className="text-xs font-semibold text-purple-300 mb-2">💡 AI 추천 피드백:</div>
                <div className="space-y-1">
                  {aiSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => onFeedbackChange(suggestion)}
                      className="w-full text-left text-xs text-purple-200 hover:text-purple-100 hover:bg-purple-800/30 p-2 rounded transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col min-h-0">
              <textarea
                id="feedback-textarea"
                value={feedback}
                onChange={(e) => onFeedbackChange(e.target.value)}
                placeholder="예시: &#10;• 제목을 더 크게 만들고 색을 파란색으로 변경해줘&#10;• 특징 목록 아래에 눈에 띄는 '지금 구매하기' 버튼을 추가해줘&#10;• 제품 이미지를 2개로 늘려서 갤러리 형태로 만들어줘"
                className="w-full flex-1 p-3 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                disabled={isApplying}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                {renderCharCount()}
                {onGenerateSuggestions && (
                  <button
                    onClick={onGenerateSuggestions}
                    disabled={isGeneratingSuggestions || !feedback.trim()}
                    className="text-xs text-purple-400 hover:text-purple-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                  >
                    {isGeneratingSuggestions ? '생성 중...' : '💡 AI 제안 받기'}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
                <div className="font-semibold mb-1">❌ 오류 발생</div>
                <div>{error}</div>
              </div>
            )}

            <div className="mt-3 shrink-0">
              <button
                onClick={onSubmit}
                disabled={isApplying || !feedback.trim()}
                className="w-full px-4 py-3 rounded-md font-bold text-base text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isApplying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>AI 적용 중...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>AI로 페이지 수정하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'templates' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 mb-3">
              자주 사용되는 개선 템플릿을 선택하세요
            </p>
            {FEEDBACK_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedTemplateId === template.id
                    ? 'bg-purple-900/30 border-purple-500'
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-sm text-gray-200 mb-1">
                  {template.title}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  {template.description}
                </div>
                <div className="text-xs text-purple-300 font-mono bg-gray-900/50 p-2 rounded">
                  "{template.example}"
                </div>
              </button>
            ))}
          </div>
        )}

        {activeSubTab === 'history' && (
          <div>
            {feedbackHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-3">📝</div>
                <p className="text-sm">아직 피드백 히스토리가 없습니다</p>
                <p className="text-xs mt-2">피드백을 적용하면 여기에 기록됩니다</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs text-gray-400">
                    최근 {feedbackHistory.length}개 피드백
                  </p>
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    전체 삭제
                  </button>
                </div>
                <div className="space-y-2">
                  {feedbackHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        item.success
                          ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                          : 'bg-red-900/20 border-red-800/50'
                      }`}
                      onClick={() => item.success && handleHistoryItemClick(item)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="text-xs text-gray-400">
                            {item.timestamp.toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div className="text-lg">
                          {item.success ? '✅' : '❌'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 font-mono bg-gray-900/50 p-2 rounded">
                        {item.feedback}
                      </div>
                      {!item.success && item.error && (
                        <div className="mt-2 text-xs text-red-400">
                          오류: {item.error}
                        </div>
                      )}
                      {item.success && (
                        <div className="mt-2 text-xs text-purple-400">
                          클릭하여 다시 적용
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedFeedbackPanel;
