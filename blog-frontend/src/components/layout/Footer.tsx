// src/components/layout/Footer.tsx
import Link from 'next/link';

// Tip tanımı
type Settings = {
  footerText: string;
  footerLinksJson?: string;
};

// Sunucu tarafında veri çek
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

// Bu bir Sunucu Bileşenidir (Server Component)
export default async function Footer() {
  const data = await getFooterData();
  if (!data) return null;

  // Veritabanından gelen Gizlilik Politikası vb. linkler
  const footerLinks = data.footerLinksJson ? JSON.parse(data.footerLinksJson) : [];
  
  // TODO: Dili 'lang' prop olarak al

  const footerStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-secondary)',
    color: 'var(--color-text)',
    padding: '2rem',
    marginTop: 'auto',
    borderTop: '2px solid var(--color-primary)'
  };

  return (
    <footer style={footerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <p>{data.footerText}</p> 
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {footerLinks.map((link: any) => (
            <Link key={link.url} href={link.url}>
              {link.text_tr || link.text}
            </Link>
          ))}
          <Link href="/contact">İletişim</Link>
        </div>
      </div>
    </footer>
  );
}