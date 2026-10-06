export type TechnicalKnowledge = {
  title: string;
  content: string;
  source: string;
};

const technicalKnowledge: TechnicalKnowledge[] = [
  {
    title: "Spindle Vibration Maintenance Guidance",
    content:
      "Persistent spindle vibration above normal operating levels may indicate bearing wear, imbalance, or spindle assembly degradation. Inspect the spindle bearings, mounting, lubrication, and mechanical alignment before returning the machine to production.",
    source: "CNC Spindle Maintenance Manual",
  },
  {
    title: "Error Code E-204",
    content:
      "E-204 indicates an abnormal spindle operating condition. When E-204 occurs together with elevated vibration or temperature, stop the machine and perform a spindle and bearing inspection.",
    source: "CNC Controller Error Code Reference",
  },
  {
    title: "Spindle Temperature Guidance",
    content:
      "A sustained increase in spindle temperature should be investigated together with vibration and motor-current measurements. Possible causes include bearing friction, inadequate lubrication, cooling problems, or mechanical overload.",
    source: "CNC Thermal Maintenance Guide",
  },
];

export function searchTechnicalKnowledge(
  query: string,
): TechnicalKnowledge[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return technicalKnowledge.filter((document) => {
    const searchableText =
      `${document.title} ${document.content}`.toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}