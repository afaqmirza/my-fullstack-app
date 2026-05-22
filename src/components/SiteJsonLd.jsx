import { Helmet } from 'react-helmet-async';
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from '../config/site';

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [SITE_URL],
  description: SITE_TAGLINE,
};

const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_TAGLINE,
  publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/tools?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function SiteJsonLd() {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(organization)}</script>
      <script type="application/ld+json">{JSON.stringify(website)}</script>
    </Helmet>
  );
}
