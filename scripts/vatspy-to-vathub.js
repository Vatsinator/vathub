/**
 * Converts VATSpy data files to JSON so that it can be read by vathub.
 */
'use strict';

var fs = require('fs');

if (process.argv.length < 4) {
  console.info(`Usage: ${process.argv[0]} ${process.argv[1]} <path-to-VATSpy.dat> <path-to-FIRBOundaries.dat>`);
  process.exit(1);
}

let countries, airports, firs, uirs;

function fetchData(fileName) {
  const data = fs.readFileSync(fileName).toString();
  const lines = data
    .split('\n')
    .map(line => line.trim())
    .filter(line => !line.startsWith(';'))
    .filter(line => line.length > 0);

  countries = lines
    .slice(1, lines.findIndex(l => l === '[Airports]'))
    .map(line => line.split('|'))
    .map(data => ({ name: data[0], code: data[1], facility: data[2] || 'Radar' }));

  console.log(`Read ${countries.length} countries`);

  const worldAirports = require('./world_airports.json');

  airports = lines
    .slice(lines.findIndex(l => l === '[Airports]') + 1, lines.findIndex(l => l === '[FIRs]'))
    .map(line => line.split('|'))
    .map(data => {
      const icao = data[0];
      const wap = worldAirports[icao];
      if (wap) {
        return {
          icao: icao,
          iata: wap.iata,
          name: wap.name,
          city: wap.city,
          position: [ parseFloat(data[2]), parseFloat(data[3]) ],
          alias: data[4],
          fir: data[5],
        };
      } else {
        return {
          icao: icao,
          name: data[1],
          position: [ parseFloat(data[2]), parseFloat(data[3]) ],
          alias: data[4],
          fir: data[5],
        };
      }
    });

  console.log(`Read ${airports.length} airports`);

  const firArray = lines
    .slice(lines.findIndex(l => l === '[FIRs]') + 1, lines.findIndex(l => l === '[UIRs]'))
    .map(line => line.split('|'))
    .map(data => ({
      icao: data[0],
      name: data[1],
      prefix: [ data[2] ].filter(p => p.length > 0),
      alias: [ data[3] ].filter(a => a !== data[0]),
      oceanic: false,
    }));

  firs = {};
  firArray.forEach(fir => {
    if (firs[fir.icao]) {
      firs[fir.icao].prefix = [...firs[fir.icao].prefix, ...fir.prefix].filter(p => p.length > 0);
      firs[fir.icao].alias = [...new Set([ ...firs[fir.icao].alias, ...fir.alias ])].filter(a => a !== fir.icao);
    } else {
      firs[fir.icao] = fir;
    }
  });

  firs = Object.values(firs);
  console.log(`Read ${firs.length} FIRs`);
  firs = [ ...firs, ...firs.map(fir => ({ ...fir, icao: fir.icao + ' Oceanic', oceanic: true })) ];
  firs.forEach(f => f.boundaries = []);

  uirs = lines
    .slice(lines.findIndex(l => l === '[UIRs]') + 1, lines.findIndex(l => l === '[IDL]'))
    .map(line => line.split('|'))
    .map(data => ({
      icao: data[0],
      name: data[1],
      firs: data[2].split(','),
    }));

  console.log(`Read ${uirs.length} UIRs`);

  fs.writeFileSync('airports.json', JSON.stringify(airports, null, 2));
  fs.writeFileSync('uirs.json', JSON.stringify(uirs, null, 2));
}

function fetchFirs(fileName) {
  const data = fs.readFileSync(fileName).toString();
  const lines = data
    .split('\n')
    .map(line => line.trim())
    .filter(line => !line.startsWith(';'))
    .filter(line => line.length > 0);

  lines
    .filter(line => line.match(/^[A-Z\-]+\|\d\|\d\|\d+\|-?[\d\.]+\|-?[\d\.]+\|-?[\d\.]+\|-?[\d\.]+\|-?[\d\.]+\|-?[\d\.]+$/))
    .forEach(line => {
      const data = line.split('|');
      let icao = data[0];
      console.log(`Parsing ${icao}`);
      const isOceanic = !!parseInt(data[1]);

      if (isOceanic) {
        icao = `${icao} Oceanic`;
      }

      const fir = firs.find(f => f.icao === icao);
      if (!fir) {
        throw new Error(`No such fir: ${data[0]}`);
      }

      const countryCode = fir.icao.slice(0, 2);
      const country = countries.find(c => c.code === countryCode);
      if (!country) {
        console.log(`No country for ${fir.icao}`);
      } else {
        fir.country = country.name;
      }

      const latitude = parseFloat(data[8]);
      const longitude = parseFloat(data[9]);
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error(`Invalid label position for ${fir.icao}`);
      } else {
        fir.labelPosition = [ latitude, longitude ];
      }

      const count = parseInt(data[3]);
      const from = lines.indexOf(line) + 1;
      const boundaries = lines
        .slice(from, from + count)
        .map(firLine => firLine.split('|'))
        .map(data => [ parseFloat(data[0]), parseFloat(data[1]) ]);

      fir.boundaries.push(boundaries);
    });

  fs.writeFileSync('firs.json', JSON.stringify(firs.filter(fir => fir.boundaries.length > 0), null, 2));
}

fetchData(process.argv[2]);
fetchFirs(process.argv[3]);
