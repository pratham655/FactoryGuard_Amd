
import { getMaintenanceHistory } from "./maintenance-history";
import { searchTechnicalKnowledge } from "./technical-knowledge";

export type EvidenceSourceType = "technical" | "maintenance";

export type RetrievedEvidence = {
  sourceType: EvidenceSourceType;
  title: string;
  content: string;
  source: string;
  sourceId: string;
  relevanceScore: number;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "is",
  "of",
  "on",
  "the",
  "to",
  "with",
  "machine",
  "machines",
]);

function tokenize(text: string): string[] {
  return [
    ...new Set(
      (text.toLowerCase().match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? [])
        .filter((term) => !STOP_WORDS.has(term)),
    ),
  ];
}

function calculateRelevance(
  queryTerms: string[],
  title: string,
  content: string,
  source: string,
): number {
  const normalizedTitle = title.toLowerCase();
  const normalizedContent = content.toLowerCase();
  const normalizedSource = source.toLowerCase();

  return queryTerms.reduce((score, term) => {
    if (normalizedTitle.includes(term)) {
      return score + 3;
    }

    if (normalizedContent.includes(term)) {
      return score + 1;
    }

    if (normalizedSource.includes(term)) {
      return score + 1;
    }

    return score;
  }, 0);
}

export function retrieveEvidence(
  query: string,
  machineId?: string,
  limit = 5,
): RetrievedEvidence[] {
  if (!Number.isFinite(limit) || limit <= 0) {
    return [];
  }

  const queryTerms = tokenize(query);

  if (queryTerms.length === 0) {
    return [];
  }

  const results: RetrievedEvidence[] = [];
  const technicalDocuments = new Map<
    string,
    { title: string; content: string; source: string }
  >();

  // Search technical guidance using each meaningful query term.
  for (const term of queryTerms) {
    for (const document of searchTechnicalKnowledge(term)) {
      const key = `${document.source}:${document.title}`;

      technicalDocuments.set(key, {
        title: document.title,
        content: document.content,
        source: document.source,
      });
    }
  }

  for (const [key, document] of technicalDocuments) {
    const relevanceScore = calculateRelevance(
      queryTerms,
      document.title,
      document.content,
      document.source,
    );

    if (relevanceScore > 0) {
      results.push({
        sourceType: "technical",
        title: document.title,
        content: document.content,
        source: document.source,
        sourceId: `technical:${key}`,
        relevanceScore,
      });
    }
  }

  // Never mix maintenance records from unrelated machines.
  if (machineId?.trim()) {
    for (const record of getMaintenanceHistory(machineId)) {
      const title = record.issue;
      const content =
        `Issue: ${record.issue}. ` +
        `Action: ${record.action}. ` +
        `Downtime: ${record.downtimeMinutes} minutes. ` +
        `Date: ${record.date}.`;

      const source = `Maintenance history — ${machineId}`;

      const relevanceScore = calculateRelevance(
        queryTerms,
        title,
        content,
        source,
      );

      if (relevanceScore > 0) {
        results.push({
          sourceType: "maintenance",
          title,
          content,
          source,
          sourceId: `maintenance:${machineId}:${record.date}`,
          relevanceScore,
        });
      }
    }
  }

  return results
    .sort(
      (a, b) =>
        b.relevanceScore - a.relevanceScore ||
        a.title.localeCompare(b.title),
    )
    .slice(0, Math.floor(limit));
}
