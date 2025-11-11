// src/components/layout/Footer.tsx
import Link from 'next/link';

// Tip tanımı
type Settings = {
  footerText: string;
  footerLinksJson?: string;
};

// Sunucu tarafında veriyi çek
async function getFooterData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 3600 } // 1 saatte bir
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      footerText: data.footerText,
      footerLinksJson: data.footerLinksJson,
    } as Settings;
  } catch (error) {
    return null;
  }
}

// Bu bir Sunucu Bileşenidir (Server Component), çok hızlıdır.
export default async function Footer() {
  const data = await getFooterData();
  if (!data) return null;

  const footerLinks = data.footerLinksJson ? JSON.parse(data.footerLinksJson) : [];

  const footerStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-secondary)',
    color: 'var(--color-text)',
    padding: '2rem',
    marginTop: 'auto', // Sayfa içeriği kısa olsa bile en altta kalır
    borderTop: '2px solid var(--color-primary)'
  };

  return (
    <footer style={footerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <p>{data.footerText}</p> 
        </div>
        {/* Footer Linkleri (örn: Gizlilik Sözleşmesi) */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {footerLinks.map((link: any) => (
            <Link key={link.url} href={link.url}>
              {/* TODO: Dil seçimine göre _tr/_en göster */}
              {link.text_tr || link.text}
            </Link>
          ))}
          <Link href="/contact">İletişim</Link>
        </div>
      </div>
    </footer>
  );
}