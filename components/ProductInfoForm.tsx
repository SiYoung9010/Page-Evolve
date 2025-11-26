import React, { useState } from 'react';
import { ProductInfo, DEFAULT_PRODUCT_INFO } from '../types/product';
import SmartPasteInput from './SmartPasteInput';
import { parseProductInfo } from '../services/geminiService';

interface Props {
  onGenerateHTML: (productInfo: ProductInfo) => void;
  isGenerating: boolean;
}

const ProductInfoForm: React.FC<Props> = ({ onGenerateHTML, isGenerating }) => {
  const [product, setProduct] = useState<ProductInfo>(DEFAULT_PRODUCT_INFO);
  const [activeSection, setActiveSection] = useState<'basic' | 'details' | 'trust' | 'purchase'>('basic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSmartAnalyze = async (text: string, images: File[]) => {
    setIsAnalyzing(true);
    try {
      const parsedInfo = await parseProductInfo(text, images);
      setProduct(prev => ({
        ...prev,
        ...parsedInfo,
        // Preserve existing reviews if AI didn't find any
        reviews: parsedInfo.reviews.count > 0 ? parsedInfo.reviews : prev.reviews
      }));
      alert('제품 정보가 자동으로 입력되었습니다! 내용을 확인해주세요.');
    } catch (error) {
      alert('분석에 실패했습니다: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddFeature = () => {
    setProduct(prev => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const handleUpdateFeature = (index: number, value: string) => {
    setProduct(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f),
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setProduct(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpec = () => {
    setProduct(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const handleUpdateSpec = (index: number, field: 'key' | 'value', value: string) => {
    setProduct(prev => ({
      ...prev,
      specifications: prev.specifications.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handleRemoveSpec = (index: number) => {
    setProduct(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const toggleBadge = (badge: ProductInfo['badges'][0]) => {
    setProduct(prev => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge],
    }));
  };

  return (
    <div className="h-full flex flex-col p-4 overflow-auto">
      <SmartPasteInput onAnalyze={handleSmartAnalyze} isAnalyzing={isAnalyzing} />

      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-200 mb-2">📦 제품 정보 입력</h2>
        <p className="text-xs text-gray-400">
          제품 정보를 입력하면 AI가 최적화된 상세페이지 HTML을 자동 생성합니다
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          { id: 'basic', label: '기본정보', icon: '📝' },
          { id: 'details', label: '상세정보', icon: '📋' },
          { id: 'trust', label: '신뢰요소', icon: '⭐' },
          { id: 'purchase', label: '구매정보', icon: '🛒' },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${activeSection === section.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            {section.icon} {section.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="flex-1 space-y-4 overflow-auto">
        {activeSection === 'basic' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">제품명 *</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="프리미엄 세럼"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">가격 *</label>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => setProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">정가</label>
                <input
                  type="number"
                  value={product.originalPrice || ''}
                  onChange={(e) => setProduct(prev => ({ ...prev, originalPrice: Number(e.target.value) || undefined }))}
                  className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">제품 설명 *</label>
              <textarea
                value={product.description}
                onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
                placeholder="피부에 깊은 영양을 공급하는..."
              />
            </div>
          </>
        )}

        {activeSection === 'details' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">주요 특징</label>
              {product.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleUpdateFeature(index, e.target.value)}
                    className="flex-1 p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="24시간 보습 지속"
                  />
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className="px-3 py-2 bg-red-700 hover:bg-red-600 rounded text-xs font-semibold"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddFeature}
                className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-semibold mt-2"
              >
                + 특징 추가
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">제품 스펙</label>
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleUpdateSpec(index, 'key', e.target.value)}
                    className="w-1/3 p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="용량"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleUpdateSpec(index, 'value', e.target.value)}
                    className="flex-1 p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="50ml"
                  />
                  <button
                    onClick={() => handleRemoveSpec(index)}
                    className="px-3 py-2 bg-red-700 hover:bg-red-600 rounded text-xs font-semibold"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddSpec}
                className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-semibold mt-2"
              >
                + 스펙 추가
              </button>
            </div>
          </>
        )}

        {activeSection === 'trust' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">배지</label>
              <div className="flex flex-wrap gap-2">
                {(['bestseller', 'new', 'limited', 'eco-friendly', 'certified'] as const).map((badge) => (
                  <button
                    key={badge}
                    onClick={() => toggleBadge(badge)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${product.badges.includes(badge)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    {badge === 'bestseller' && '베스트셀러'}
                    {badge === 'new' && '신제품'}
                    {badge === 'limited' && '한정판'}
                    {badge === 'eco-friendly' && '친환경'}
                    {badge === 'certified' && '인증완료'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">별점</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={product.reviews.rating}
                  onChange={(e) => setProduct(prev => ({
                    ...prev,
                    reviews: { ...prev.reviews, rating: Number(e.target.value) },
                  }))}
                  className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">리뷰 개수</label>
                <input
                  type="number"
                  value={product.reviews.count}
                  onChange={(e) => setProduct(prev => ({
                    ...prev,
                    reviews: { ...prev.reviews, count: Number(e.target.value) },
                  }))}
                  className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </>
        )}

        {activeSection === 'purchase' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">재고</label>
              <input
                type="number"
                value={product.stock || ''}
                onChange={(e) => setProduct(prev => ({ ...prev, stock: Number(e.target.value) || undefined }))}
                className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="선택사항"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">배송 정보</label>
              <input
                type="text"
                value={product.deliveryInfo}
                onChange={(e) => setProduct(prev => ({ ...prev, deliveryInfo: e.target.value }))}
                className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="1-3일 이내 배송"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">반품 정책</label>
              <input
                type="text"
                value={product.returnPolicy}
                onChange={(e) => setProduct(prev => ({ ...prev, returnPolicy: e.target.value }))}
                className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="7일 이내 무료 교환/반품"
              />
            </div>
          </>
        )}
      </div>

      {/* Generate Button */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={() => onGenerateHTML(product)}
          disabled={isGenerating || !product.name || !product.price}
          className="w-full px-4 py-3 rounded-md font-bold text-base text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>HTML 생성 중...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>AI로 상세페이지 생성</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductInfoForm;
