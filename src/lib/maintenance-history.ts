export type MaintenanceRecord = {
  date: string;
  issue: string;
  action: string;
  downtimeMinutes: number;
};

const maintenanceHistory: Record<string, MaintenanceRecord[]> = {
  "CNC-07": [
    {
      date: "2026-09-18",
      issue: "Elevated spindle vibration",
      action: "Inspected spindle assembly and lubricated bearing housing",
      downtimeMinutes: 85,
    },
    {
      date: "2026-08-27",
      issue: "Intermittent spindle temperature increase",
      action: "Checked cooling system and replaced coolant filter",
      downtimeMinutes: 60,
    },
    {
      date: "2026-07-14",
      issue: "Abnormal motor current",
      action: "Inspected spindle drive and tightened electrical connections",
      downtimeMinutes: 45,
    },
  ],
};

export function getMaintenanceHistory(
  machineId: string,
): MaintenanceRecord[] {
  return maintenanceHistory[machineId] ?? [];
}