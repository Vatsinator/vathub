import moment from 'moment';
import logger from '../logger';
import { Atc, LatLng, Pilot } from './models';

enum DataIndex {
  Callsign = 0, Pid, RealName, ClientType, Frequency, Latitude, Longitude,
  Altitude, Groundspeed, PlannedAircraft, PlannedTascruise, PlannedDepAirport,
  PlannedAltitude, PlannedDestairport, Server, Protrevision, Rating,
  Transponder, FacilityType, VisualRange, PlannedRevision, PlannedFlightType,
  PlannedDepTime, ActualDepTime, PlannedHrsEnroute, PlannedMinsEnroute,
  PlannedHrsFuel, PlannedMinFuel, PlannedAltAirport, PlannedRemarks,
  PlannedRoute, PlannedDepAirportLat, PlannedDepAirportLon, PlannedDestAirportLat,
  PlannedDestAirportLon, AtisMessage, TimeLastAtisReceived, TimeLogon, Heading,
  QnhIhg, QnhMb,
}

function client(data: string[]) {
  const latitude = parseFloat(data[DataIndex.Latitude]);
  const longitude = parseFloat(data[DataIndex.Longitude]);

  // Empty position may sometimes happen, but it appears to happen for clients who just logged into vatsim
  // and is corrected with the very next update
  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }

  return {
    callsign: data[DataIndex.Callsign],
    cid: parseInt(data[DataIndex.Pid], 10),
    name: data[DataIndex.RealName],
    position: [ latitude, longitude ] as LatLng,
    onlineFrom: moment(data[DataIndex.TimeLogon], 'YYYYMMDDHHmmss').toDate(),
  };
}

function facility(callsign: string) {
  const match = callsign.match(/^.+_([A-Z]+)$/);
  if (match) {
    return match[1];
  } else {
    return 'OBS';
  }
}

export default function parseClient(clientLine: string): Pilot | Atc {
  const data = clientLine.split(':');
  if (data.length !== 42) {
    logger.warn(`invalid client: "${clientLine}"`);
    return null;
  }

  const clientBase = client(data);
  if (!clientBase) {
    return null;
  }

  const clientType = data[DataIndex.ClientType];
  switch (clientType) {
    case 'ATC': return {
      ...clientBase,
      type: 'atc',
      frequency: data[DataIndex.Frequency],
      rating: parseInt(data[DataIndex.Rating], 10),
      facility: facility(data[DataIndex.Callsign]),
    };

    case 'PILOT': return {
      ...clientBase,
      type: 'pilot',
      aircraft: data[DataIndex.PlannedAircraft],
      heading: parseInt(data[DataIndex.Heading], 10),
      from: data[DataIndex.PlannedDepAirport],
      to: data[DataIndex.PlannedDestairport],
      groundSpeed: parseInt(data[DataIndex.Groundspeed], 10),
      transponder: parseInt(data[DataIndex.Transponder], 10),
      altitude: parseInt(data[DataIndex.Altitude], 10),
      route: data[DataIndex.PlannedRoute],
      remarks: data[DataIndex.PlannedRemarks],
    };

    default:
      logger.warn(`unknown client type: "${clientLine}"`);
      return null;
  }
}
