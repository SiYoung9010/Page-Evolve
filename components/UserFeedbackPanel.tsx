// components/UserFeedbackPanel.tsx
import React from 'react';

interface Props {
  feedback: string;
  onFeedbackChange: (text: string) => void;
  onSubmit: () => void;
  isApplying: boolean;
  error: string | null;
}

const UserFeedbackPanel: React.FC<Props> = ({ feedback, onFeedbackChange, onSubmit, isApplying, error }) => {
  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex-1 flex flex-col">
        <label htmlFor="feedback-textarea" className="text-sm font-semibold text-gray-300 mb-2">
          AI에게 피드백 주기
        </label>
        <p className="text-xs text-gray-500 mb-3">
          원하는 변경사항을 설명해주세요. 예: "제목을 더 크게 파란색으로 변경해줘" 또는 "특징 목록 아래에 '구매하기' 버튼을 추가해줘."
        </p>
        <textarea
          id="feedback-textarea"
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="여기에 피드백을 입력하세요..."
          className="w-full flex-1 p-3 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          disabled={isApplying}
        />
        {error && <div className="mt-3 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">{error}</div>}
      </div>
      <div className="mt-4 shrink-0">
        <button
          onClick={onSubmit}
          disabled={isApplying || !feedback.trim()}
          className="w-full px-4 py-3 rounded-md font-bold text-base text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isApplying ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>AI 적용 중...</span>
            </>
          ) : (
            '📝 AI로 피드백 적용'
          )}
        </button>
      </div>
    </div>
  );
};

export default UserFeedbackPanel;
