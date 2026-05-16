const bd = require('bd-geo-location');

// bd.bangladeshData might be the full object.
const data = bd.bangladeshData;

// Let's explore its structure
let districtMap = {};

for (const division of data.divisions) {
  for (const district of division.districts) {
    const dName = district.name;
    const upazilas = district.upazilas.map(u => ({en: u.name, bn: u.bn_name || u.name}));
    districtMap[dName] = upazilas;
  }
}

const fs = require('fs');
fs.writeFileSync('src/upazilas.json', JSON.stringify(districtMap, null, 2));
console.log('Saved upazilas.json');
