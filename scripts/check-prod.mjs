const url = process.argv[2] ?? 'https://app.evorios.com';
const res = await fetch(url);
const html = await res.text();
const bundle = html.match(/assets\/index-[^"']+\.js/)?.[0] ?? 'none';
const sw = html.match(/sw\.js[^"']*/)?.[0];
console.log(JSON.stringify({
  url,
  status: res.status,
  lastModified: res.headers.get('last-modified'),
  cacheControl: res.headers.get('cache-control'),
  etag: res.headers.get('etag'),
  bundle,
  sw,
  htmlSnippet: html.slice(0, 800),
}, null, 2));
