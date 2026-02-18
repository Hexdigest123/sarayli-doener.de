export function GET() {
	const site = 'https://sarayli-doener.de';
	const lastmod = new Date().toISOString().split('T')[0];

	const urls = [
		{ loc: site, priority: '1.0' },
		{ loc: `${site}/en`, priority: '0.8' },
		{ loc: `${site}/tr`, priority: '0.8' }
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
	.map(
		(u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
    <xhtml:link rel="alternate" hreflang="de" href="${site}" />
    <xhtml:link rel="alternate" hreflang="en" href="${site}/en" />
    <xhtml:link rel="alternate" hreflang="tr" href="${site}/tr" />
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=86400'
		}
	});
}
