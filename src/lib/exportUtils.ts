export interface BriefData {
  title?: string;
  geoScore: number;
  query: string;
  optimizedPassage: string;
  strengths: string[];
  weaknesses: string[];
  rating: {
    declarativeAnswers: number;
    factualDensity: number;
    citationTriggers: number;
    keywordRetrievalStructure: number;
  };
}

export function formatBriefAsMarkdown(data: BriefData): string {
  const today = new Date().toISOString().slice(0, 10);
  return `---
# CONTENT BRIEF — GEO Optimized
**Query context:** ${data.query}
**GEO Score:** ${data.geoScore}/100
**Date:** ${today}

## Recommended passage (copy-paste ready)
> ${data.optimizedPassage.split('\n').join('\n> ')}

## GEO Scores breakdown
| Dimension | Score | Max |
|-----------|-------|-----|
| Direct declarative answers | ${data.rating.declarativeAnswers} | 25 |
| Factual density | ${data.rating.factualDensity} | 25 |
| Citation triggers | ${data.rating.citationTriggers} | 25 |
| Intent resolution | ${data.rating.keywordRetrievalStructure} | 25 |

## Strengths ✓
${data.strengths.map(s => '- ' + s).join('\n')}

## Weaknesses to fix ✗
${data.weaknesses.map(w => '- ' + w).join('\n')}
---`;
}

export function copyAsMarkdownBrief(data: BriefData): void {
  const md = formatBriefAsMarkdown(data);
  navigator.clipboard.writeText(md).catch(() => {
    const el = document.createElement('textarea');
    el.value = md;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  });
}

export function downloadAsTxt(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
