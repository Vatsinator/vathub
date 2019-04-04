import { LatLng } from '../vatsim/models/latlng';
import firList from './firs.json';
import { Fir } from './models';

interface DbPosition {
  latitude: number;
  longitude: number;
}

const toLatLng = (point: DbPosition): LatLng => {
  return [ point.latitude, point.longitude ];
};

const mapDbPolygon = (polygon: DbPosition[]): LatLng[] => {
  return polygon.map(point => toLatLng(point));
};

const mappedFirList: Fir[] = firList.map(entry => {
  const { border, labelPosition, ...tmpFir } = entry;

  if (border.length > 0) {
    let mappedBorder: LatLng[][];

    if (Array.isArray(border[0])) { // multpiple polygons
      mappedBorder = (border as DbPosition[][]).map((polygon: DbPosition[]) => mapDbPolygon(polygon));
    } else {
      mappedBorder = [ mapDbPolygon(border as DbPosition[]) ];
    }
    return { ...tmpFir, labelPosition: toLatLng(labelPosition), border: mappedBorder };
  } else {
    return { ...tmpFir, labelPosition: toLatLng(labelPosition), border: [] };
  }
});

export const firMap: Map<string, Fir> = new Map(mappedFirList.map(fir => [fir.icao, fir] as [string, Fir]));
