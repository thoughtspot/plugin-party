const svgstore = require('svgstore');
const fs = require('fs');
const path = require('path');

const icons = fs.readdirSync(path.resolve(__dirname, '../src'));
const sprite = svgstore();

icons.forEach((icon) => {
  const name = path.parse(icon).name;
  sprite.add(
    name,
    fs.readFileSync(path.resolve(__dirname, `../src/${icon}`), 'utf8')
  );
});

try {
  fs.mkdirSync(path.resolve(__dirname, '../lib'));
} catch (e) {
  //
}

fs.writeFileSync(
  path.resolve(__dirname, '../lib/icon-sprite.svg'),
  sprite.toString({ inline: true })
);
