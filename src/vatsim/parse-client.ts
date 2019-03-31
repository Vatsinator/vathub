import { Atc, Pilot } from './models';

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
  return {
    callsign: data[DataIndex.Callsign],
    cid: parseInt(data[DataIndex.Pid], 10),
    name: data[DataIndex.RealName],
    position: {
      latitude: parseFloat(data[DataIndex.Latitude]),
      longitude: parseFloat(data[DataIndex.Longitude]),
    },
  };
}

export default function parseClient(clientLine: string): Pilot | Atc {
  const data = clientLine.split(':');
  if (data.length !== 42) {
    throw new Error(`invalid client: "${clientLine}"`);
  }

  const clientType = data[DataIndex.ClientType];
  switch (clientType) {
    case 'ATC': return {
      ...client(data),
      type: 'atc',
      frequency: data[DataIndex.Frequency],
    };

    case 'PILOT': return {
      ...client(data),
      type: 'pilot',
      aircraft: data[DataIndex.PlannedAircraft],
      heading: parseInt(data[DataIndex.Heading], 10),
      from: data[DataIndex.PlannedDepAirport],
      to: data[DataIndex.PlannedDestairport],
      groundSpeed: parseInt(data[DataIndex.Groundspeed], 10),
    };

    default: throw new Error(`unknown client type: "${clientType}"`);
  }
}
