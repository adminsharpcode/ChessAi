const fs = require('fs');
const path = require('path');

const pgnPath = path.join(__dirname, '..', 'games', 'Carlsen.pgn');
console.log('Reading:', pgnPath);

const content = fs.readFileSync(pgnPath, 'utf8');
const rawGames = content.split(/\r?\n(?=\[Event )/);
console.log('Total games found:', rawGames.length);

const catalog = [];
for (let i = 0; i < rawGames.length; i++) {
  const g = rawGames[i].trim();
  if (!g) continue;

  const whiteMatch = g.match(/\[White\s+"([^"]+)"\]/);
  const blackMatch = g.match(/\[Black\s+"([^"]+)"\]/);
  const eventMatch = g.match(/\[Event\s+"([^"]+)"\]/);
  const dateMatch = g.match(/\[Date\s+"([^"]+)"\]/);
  const resultMatch = g.match(/\[Result\s+"([^"]+)"\]/);
  const ecoMatch = g.match(/\[ECO\s+"([^"]+)"\]/);

  catalog.push({
    id: i,
    white: whiteMatch ? whiteMatch[1] : 'Unknown',
    black: blackMatch ? blackMatch[1] : 'Unknown',
    event: eventMatch ? eventMatch[1] : 'Unknown Event',
    date: dateMatch ? dateMatch[1] : '',
    result: resultMatch ? resultMatch[1] : '*',
    eco: ecoMatch ? ecoMatch[1] : ''
  });
}

const outputPath = path.join(__dirname, '..', 'games', 'carlsen-catalog.json');
fs.writeFileSync(outputPath, JSON.stringify(catalog));
console.log(`Saved catalog with ${catalog.length} games to ${outputPath}`);
