import sharp from 'sharp';

const LONG = 480;
const PALETTE = ['#D4537E', '#7F77DD', '#1D9E75', '#BA7517', '#378ADD', '#E24B4A', '#0F6E56'];

const SPECS = [
  ['square', 1, 1],
  ['landscape-43', 4, 3],
  ['landscape-32', 3, 2],
  ['wide-169', 16, 9],
  ['portrait-23', 2, 3],
  ['portrait-34', 3, 4],
  ['pano-31', 3, 1],
];

const outDir = 'tests/fixtures/assets/interests';

for (let i = 0; i < SPECS.length; i += 1) {
  const [name, w, h] = SPECS[i];
  const ratio = w / h;
  const width = ratio >= 1 ? LONG : Math.round(LONG * ratio);
  const height = ratio >= 1 ? Math.round(LONG / ratio) : LONG;
  const color = PALETTE[i % PALETTE.length];
  const label = w + ':' + h;
  const fontSize = Math.round(Math.min(width, height) / 5);
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">' +
    '<rect width="100%" height="100%" fill="' + color + '"/>' +
    '<text x="50%" y="50%" fill="#ffffff" font-family="sans-serif" font-size="' + fontSize + '" font-weight="bold" text-anchor="middle" dominant-baseline="central">' + label + '</text>' +
    '</svg>';
  await sharp(Buffer.from(svg)).png().toFile(outDir + '/' + name + '.png');
  console.log(name + '.png  ' + width + 'x' + height + '  ratio=' + ratio.toFixed(3));
}
