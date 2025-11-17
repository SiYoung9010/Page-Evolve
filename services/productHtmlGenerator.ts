import { ProductInfo } from '../types/product';

/**
 * Generates a complete, optimized e-commerce product page HTML from ProductInfo
 */
export const generateProductHTML = (product: ProductInfo): string => {
  const discountRate = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discountRate || 0;

  const stars = '⭐'.repeat(Math.floor(product.reviews.rating));
  const halfStar = product.reviews.rating % 1 >= 0.5 ? '½' : '';

  const badgeText: Record<string, string> = {
    bestseller: '베스트셀러',
    new: '신제품',
    limited: '한정판',
    'eco-friendly': '친환경',
    certified: '인증완료',
  };

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${product.name} - 상품 상세페이지</title>
  <meta name="description" content="${product.description}">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }

    /* Header Section */
    .product-header {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }

    @media (max-width: 768px) {
      .product-header {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }

    .product-image {
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-center;
      color: white;
      font-size: 24px;
      font-weight: bold;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .product-title {
      font-size: 32px;
      font-weight: bold;
      color: #1a1a1a;
      line-height: 1.3;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
    }

    .rating-stars {
      color: #fbbf24;
      font-size: 20px;
    }

    .rating-count {
      color: #666;
      font-size: 14px;
    }

    .price-section {
      padding: 20px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 12px;
      border: 2px solid #0ea5e9;
    }

    .original-price {
      font-size: 18px;
      color: #999;
      text-decoration: line-through;
      margin-bottom: 5px;
    }

    .current-price {
      font-size: 36px;
      font-weight: bold;
      color: #dc2626;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .discount-badge {
      padding: 6px 12px;
      background: #dc2626;
      color: white;
      border-radius: 6px;
      font-size: 20px;
    }

    .cta-buttons {
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }

    .btn {
      flex: 1;
      padding: 18px 24px;
      border: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-secondary {
      background: white;
      color: #10b981;
      border: 2px solid #10b981;
    }

    .btn-secondary:hover {
      background: #f0fdf4;
    }

    /* Stock Alert */
    ${product.stock && product.stock < 10 ? `
    .stock-alert {
      padding: 12px 16px;
      background: #fef2f2;
      border: 2px solid #dc2626;
      border-radius: 8px;
      color: #dc2626;
      font-weight: bold;
      text-align: center;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
    ` : ''}

    /* Features Section */
    .section {
      margin: 40px 0;
      padding: 30px;
      background: white;
      border-radius: 12px;
    }

    .section-title {
      font-size: 28px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #667eea;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .feature-card {
      padding: 20px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border-radius: 12px;
      border-left: 4px solid #0ea5e9;
    }

    .feature-card::before {
      content: '✨';
      font-size: 24px;
      display: block;
      margin-bottom: 10px;
    }

    .feature-text {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }

    /* Specifications Table */
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    .specs-table tr {
      border-bottom: 1px solid #e5e7eb;
    }

    .specs-table td {
      padding: 16px;
      font-size: 15px;
    }

    .specs-table td:first-child {
      font-weight: bold;
      color: #666;
      width: 30%;
      background: #f9fafb;
    }

    /* Reviews Section */
    .reviews-summary {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 30px;
      align-items: center;
    }

    @media (max-width: 768px) {
      .reviews-summary {
        grid-template-columns: 1fr;
      }
    }

    .rating-big {
      text-align: center;
      padding: 30px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 12px;
    }

    .rating-number {
      font-size: 48px;
      font-weight: bold;
      color: #1a1a1a;
    }

    .rating-stars-big {
      font-size: 28px;
      color: #fbbf24;
    }

    .review-highlights {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .review-highlight {
      padding: 15px 20px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #fbbf24;
      font-size: 15px;
    }

    /* Delivery & Return */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }

    .info-card {
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
    }

    .info-card h3 {
      font-size: 18px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-card p {
      color: #666;
      font-size: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Product Header -->
    <div class="product-header">
      <!-- Product Image -->
      <div>
        <div class="product-image">
          ${product.mainImage || '📦 제품 이미지'}
        </div>
      </div>

      <!-- Product Information -->
      <div class="product-info">
        ${product.badges.length > 0 ? `
        <div class="badges">
          ${product.badges.map(badge => `<span class="badge">${badgeText[badge]}</span>`).join('')}
        </div>
        ` : ''}

        <h1 class="product-title">${product.name}</h1>

        <div class="rating">
          <span class="rating-stars">${stars}${halfStar}</span>
          <span><strong>${product.reviews.rating}</strong> / 5.0</span>
          <span class="rating-count">(${product.reviews.count.toLocaleString()}개 리뷰)</span>
        </div>

        <div class="price-section">
          ${product.originalPrice ? `
          <div class="original-price">${product.originalPrice.toLocaleString()}원</div>
          ` : ''}
          <div class="current-price">
            <span>${product.price.toLocaleString()}원</span>
            ${discountRate > 0 ? `<span class="discount-badge">${discountRate}%</span>` : ''}
          </div>
          <div class="cta-buttons">
            <button class="btn btn-primary">지금 구매하기</button>
            <button class="btn btn-secondary">장바구니</button>
          </div>
        </div>

        ${product.stock && product.stock < 10 ? `
        <div class="stock-alert">
          ⚠️ 재고 ${product.stock}개 남음 - 서둘러 주문하세요!
        </div>
        ` : ''}
      </div>
    </div>

    <!-- Description -->
    <section class="section">
      <h2 class="section-title">제품 설명</h2>
      <p style="font-size: 16px; line-height: 1.8; color: #333;">
        ${product.description}
      </p>
    </section>

    <!-- Features -->
    ${product.features.length > 0 ? `
    <section class="section" style="background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);">
      <h2 class="section-title">주요 특징</h2>
      <div class="features-grid">
        ${product.features.map(feature => `
        <div class="feature-card">
          <div class="feature-text">${feature}</div>
        </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Specifications -->
    ${product.specifications.length > 0 ? `
    <section class="section">
      <h2 class="section-title">제품 스펙</h2>
      <table class="specs-table">
        ${product.specifications.map(spec => `
        <tr>
          <td>${spec.key}</td>
          <td>${spec.value}</td>
        </tr>
        `).join('')}
      </table>
    </section>
    ` : ''}

    <!-- Reviews -->
    ${product.reviews.highlights.length > 0 ? `
    <section class="section" style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);">
      <h2 class="section-title">고객 리뷰</h2>
      <div class="reviews-summary">
        <div class="rating-big">
          <div class="rating-number">${product.reviews.rating}</div>
          <div class="rating-stars-big">${stars}${halfStar}</div>
          <div style="margin-top: 10px; color: #666;">${product.reviews.count.toLocaleString()}개 리뷰</div>
        </div>
        <div class="review-highlights">
          ${product.reviews.highlights.map(highlight => `
          <div class="review-highlight">💬 "${highlight}"</div>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- Delivery & Return Information -->
    <section class="section">
      <h2 class="section-title">배송 & 반품 안내</h2>
      <div class="info-grid">
        <div class="info-card">
          <h3>🚚 배송 정보</h3>
          <p>${product.deliveryInfo}</p>
        </div>
        <div class="info-card">
          <h3>🔄 반품 정책</h3>
          <p>${product.returnPolicy}</p>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <div style="text-align: center; padding: 40px 0;">
      <button class="btn btn-primary" style="max-width: 500px; width: 100%;">
        ${product.price.toLocaleString()}원 - 지금 바로 구매하기
      </button>
    </div>
  </div>
</body>
</html>`;
};
