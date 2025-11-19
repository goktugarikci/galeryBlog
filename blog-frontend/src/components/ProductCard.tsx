// src/components/ProductCard.tsx
import Link from 'next/link';

// Tipler
type Product = { 
  id: string; 
  name_tr: string; name_en?: string; 
  shortDescription_tr?: string; shortDescription_en?: string;
  price: number; 
  originalPrice?: number;
  discountLabel?: string;
  galleryImages: { imageUrl: string }[];
};

// Props
type ProductCardProps = {
  product: Product;
  lang: string;
  enableEnglish: boolean;
};

export default function ProductCard({ product, lang, enableEnglish }: ProductCardProps) {
  
  // Dile göre başlık ve açıklamayı seç
  const title = (lang === 'en' && enableEnglish && product.name_en) ? product.name_en : product.name_tr;
  const description = (lang === 'en' && enableEnglish && product.shortDescription_en) 
                      ? product.shortDescription_en 
                      : product.shortDescription_tr;

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--color-secondary)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };
  
  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-btn-addtocart)', // Veritabanından gelen buton rengi
    color: 'var(--color-btn-addtocart-text)',
    padding: '0.5rem',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: 'auto' // Butonu kartın en altına iter
  };

  return (
    <div style={cardStyle}>
      <img 
        src={product.galleryImages[0]?.imageUrl || 'https://via.placeholder.com/300'} 
        alt={title}
        style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
      />
      <div style={{ padding: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{title}</h3>
        {product.discountLabel && (
          <span style={{ color: 'red', fontWeight: 'bold' }}>{product.discountLabel}</span>
        )}
        <div>
          <span style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>{product.price} TL</span>
          {product.originalPrice && (
            <span style={{ textDecoration: 'line-through', marginLeft: '0.5rem', opacity: 0.7 }}>
              {product.originalPrice} TL
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: '0.5rem 0' }}>
          {description}
        </p>
      </div>
      
      {/* TODO: Bu Link/Button'a tıklandığında useAuth ve api.post('/shop/cart') kullanarak 
          sepete ekleme işlemi (client component'te) yapılmalı veya WhatsApp moduna yönlendirmeli.
      */}
      <Link href={`/product/${product.id}`} passHref>
        <button style={buttonStyle}>
          İncele
        </button>
      </Link>
    </div>
  );
}