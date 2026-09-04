import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#ffffff"/><text x="88" y="105" font-family="Consolas, monospace" font-size="28" fill="#676767">peter@website:/root$</text><rect x="80" y="66" width="390" height="58" rx="8" fill="#fff9df"/><text x="88" y="105" font-family="Consolas, monospace" font-size="28" fill="#282828">peter@website:/root$</text><text x="82" y="320" font-family="Georgia, serif" font-size="92" font-weight="600" fill="#282828">Peter Zhang</text><text x="88" y="390" font-family="Segoe UI, sans-serif" font-size="32" fill="#676767">Personal website · Notes · Projects · Interests</text></svg>`;
await sharp(Buffer.from(svg)).png().toFile('public/social/default.png');
