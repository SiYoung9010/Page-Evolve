// components/SeoPanel.tsx
import React from 'react';
import { SeoAnalysis, SeoIssue } from '../types';

const getLabel = (key: string): string => {
  const labels: { [key: string]: string } = {
    title: 'Title Tag',
    metaDescription: 'Meta Description',
    headingStructure: 'Heading Structure',
    imageAlt: 'Image Alt Texts',
    keywordDensity: 'Keyword Density',
    contentLength: 'Content Length',
  };
  return labels[key] || key;
};

const getMaxScore = (key: string): number => {
  const maxScores: { [key: string]: number } = {
    title: 20,
    metaDescription: 15,
    headingStructure: 20,
    imageAlt: 15,
    keywordDensity: 15,
    contentLength: 15,
  };
  return maxScores[key] || 0;
};

const ScoreBar: React.FC<{ label: string; score: number; maxScore: number }> = ({ label, score, maxScore }) => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const colorClass = percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 font-semibold">{score}/{maxScore}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const IssueCard: React.FC<{ issue: SeoIssue }> = ({ issue }) => {
  const colors = {
    critical: 'border-red-500/50 bg-red-900/20',
    warning: 'border-yellow-500/50 bg-yellow-900/20',
    info: 'border-blue-500/50 bg-blue-900/20',
  };
  const icon = { critical: '❗️', warning: '⚠️', info: 'ℹ️' };
  
  return (
    <div className={`p-3 border rounded-lg text-sm ${colors[issue.type]}`}>
      <p className="text-gray-200"><span className="mr-2">{icon[issue.type]}</span>{issue.message}</p>
      {issue.fixCode && (
        <pre className="mt-2 text-xs bg-gray-900/50 p-2 rounded overflow-x-auto">
          <code>{issue.fixCode}</code>
        </pre>
      )}
    </div>
  );
};

const SeoPanel: React.FC<{ analysis: SeoAnalysis | null; isAnalyzing: boolean; }> = ({ analysis, isAnalyzing }) => {
  if (isAnalyzing) {
    return (
      <div className="p-4 text-center flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Performing SEO Analysis...</p>
      </div>
    );
  }
  
  if (!analysis) {
    return (
      <div className="p-4 text-center text-gray-500 h-full flex flex-col items-center justify-center">
        <p>Click "SEO Check" to analyze the current page.</p>
      </div>
    );
  }
  
  const { score, breakdown, issues, keywords } = analysis;
  const scoreColor = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <div className={`text-6xl font-bold ${scoreColor}`}>{score}<span className="text-3xl text-gray-500">/100</span></div>
        <div className="mt-2 w-full bg-gray-700 rounded-full h-3.5">
          <div className={`h-3.5 rounded-full transition-all duration-500 ${scoreBg}`} style={{ width: `${score}%` }} />
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300">Score Breakdown</h3>
        {Object.entries(breakdown).map(([key, value]) => (
          <ScoreBar key={key} label={getLabel(key)} score={value} maxScore={getMaxScore(key)} />
        ))}
      </div>
      
      {issues.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Identified Issues</h3>
          <div className="space-y-2">
            {issues.map((issue, idx) => <IssueCard key={idx} issue={issue} />)}
          </div>
        </div>
      )}
      
      {keywords.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Top Keywords</h3>
          <div className="space-y-1 bg-gray-800/50 p-3 rounded-lg">
            {keywords.slice(0, 5).map((kw, idx) => (
              <div key={idx} className="flex justify-between text-xs items-center">
                <span className="text-gray-300 truncate pr-2">{kw.keyword}</span>
                <span className={`font-mono px-2 py-0.5 rounded text-xs ${kw.isOptimal ? 'text-green-300 bg-green-900/50' : 'text-yellow-300 bg-yellow-900/50'}`}>
                  {kw.density.toFixed(1)}% ({kw.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeoPanel;
