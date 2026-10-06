import {
  detectIncident,
  type MachineTelemetry,
  type IncidentSeverity,
} from "./incident-detector";

export type Machine = {
  id: string;
  name: string;
  model: string;
  line: string;
  location: string;
  status: IncidentSeverity;
  telemetry: MachineTelemetry;
};

const telemetryByMachine: Record<string, MachineTelemetry> = {
  "CNC-01": {
    temperature: 67,
    vibration: 2.1,
    pressure: 4.0,
    motorCurrent: 11.2,
    errorCode: null,
  },

  "CNC-02": {
    temperature: 70,
    vibration: 2.8,
    pressure: 4.1,
    motorCurrent: 11.8,
    errorCode: null,
  },

  "CNC-03": {
    temperature: 69,
    vibration: 2.4,
    pressure: 4.0,
    motorCurrent: 11.5,
    errorCode: null,
  },

  "CNC-04": {
    temperature: 73,
    vibration: 3.1,
    pressure: 4.2,
    motorCurrent: 12.1,
    errorCode: null,
  },

  "CNC-05": {
    temperature: 68,
    vibration: 2.0,
    pressure: 3.9,
    motorCurrent: 10.9,
    errorCode: null,
  },

  "CNC-06": {
    temperature: 82,
    vibration: 5.4,
    pressure: 4.1,
    motorCurrent: 13.6,
    errorCode: null,
  },

  "CNC-07": {
    temperature: 91.4,
    vibration: 8.7,
    pressure: 4.2,
    motorCurrent: 17.8,
    errorCode: "E-204",
  },
};

const machineMetadata: Omit<Machine, "status" | "telemetry">[] = [
  {
    id: "CNC-01",
    name: "CNC-01",
    model: "Haas VF-2",
    line: "Production Line A",
    location: "Bay A1",
  },
  {
    id: "CNC-02",
    name: "CNC-02",
    model: "Mazak VCN-530C",
    line: "Production Line A",
    location: "Bay A2",
  },
  {
    id: "CNC-03",
    name: "CNC-03",
    model: "DMG MORI CMX",
    line: "Production Line A",
    location: "Bay A3",
  },
  {
    id: "CNC-04",
    name: "CNC-04",
    model: "Haas VF-4",
    line: "Production Line B",
    location: "Bay B1",
  },
  {
    id: "CNC-05",
    name: "CNC-05",
    model: "Okuma GENOS",
    line: "Production Line B",
    location: "Bay B2",
  },
  {
    id: "CNC-06",
    name: "CNC-06",
    model: "Mazak VTC",
    line: "Production Line B",
    location: "Bay B3",
  },
  {
    id: "CNC-07",
    name: "CNC-07",
    model: "DMG MORI NHX",
    line: "Production Line C",
    location: "Bay C1",
  },
];

export function getFactoryMachines(): Machine[] {
  return machineMetadata.map((machine) => {
    const telemetry = telemetryByMachine[machine.id];

    const detection = detectIncident(telemetry);

    return {
      ...machine,
      telemetry,
      status: detection.severity,
    };
  });
}