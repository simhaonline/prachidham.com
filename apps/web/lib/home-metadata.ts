import type { Metadata } from 'next';

const title = 'Prachi Dham Foundation | Gir Somnath';
const description = 'Prachi Dham Foundation is based in Gir Somnath, Gujarat. Official information about the foundation is being prepared.';

export function createHomeMetadata(origin?: string, indexable = false): Metadata {
  const homeUrl = origin ? `${origin}/` : undefined;
  const imageUrl = origin ? `${origin}/brand/logo.png` : undefined;
  return {
    title,
    description,
    robots: origin && indexable ? { index: true, follow: true } : { index: false, follow: false },
    ...(homeUrl ? { alternates: { canonical: homeUrl } } : {}),
    openGraph: {
      type: 'website', title, description, siteName: 'Prachi Dham Foundation',
      ...(homeUrl ? { url: homeUrl } : {}),
      ...(imageUrl ? { images: [{ url: imageUrl, width: 300, height: 314, alt: 'Prachi Dham Foundation logo' }] } : {}),
    },
    twitter: { card: 'summary', title, description, ...(imageUrl ? { images: [imageUrl] } : {}) },
  };
}
