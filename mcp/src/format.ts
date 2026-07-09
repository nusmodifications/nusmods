import config from './config.js';
import type { ModuleHit } from './data/elastic.js';
import type { Module, Workload } from './types/modules.js';

const SEMESTER_NAMES: Record<number, string> = {
  1: 'Semester 1',
  2: 'Semester 2',
  3: 'Special Term I',
  4: 'Special Term II',
};

function formatWorkload(workload: Workload | undefined): string | undefined {
  if (!workload) {
    return undefined;
  }
  if (typeof workload === 'string') {
    return workload;
  }
  // Tuple of [Lecture, Tutorial, Laboratory, Project, Preparation] hours/week.
  const labels = ['Lecture', 'Tutorial', 'Laboratory', 'Project', 'Preparation'];
  const parts = workload
    .map((hours, i) => (hours > 0 ? `${labels[i] ?? `Part ${i + 1}`}: ${hours}h` : null))
    .filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}

/** Human-readable summary of a module for the text content block. */
export function formatModuleSummary(module: Module): string {
  const lines: Array<string> = [];

  lines.push(`# ${module.moduleCode} ${module.title}`);
  lines.push('');
  lines.push(`- **Academic year:** ${module.acadYear}`);
  lines.push(`- **Module credits:** ${module.moduleCredit}`);
  lines.push(`- **Faculty:** ${module.faculty}`);
  lines.push(`- **Department:** ${module.department}`);

  const semesters = module.semesterData.map(
    (s) => SEMESTER_NAMES[s.semester] ?? `Semester ${s.semester}`,
  );
  if (semesters.length) {
    lines.push(`- **Offered in:** ${semesters.join(', ')}`);
  }

  const workload = formatWorkload(module.workload);
  if (workload) {
    lines.push(`- **Workload:** ${workload}`);
  }
  if (module.gradingBasisDescription) {
    lines.push(`- **Grading:** ${module.gradingBasisDescription}`);
  }
  if (module.aliases?.length) {
    lines.push(`- **Also coded as:** ${module.aliases.join(', ')}`);
  }

  if (module.prerequisite) {
    lines.push(`- **Prerequisite:** ${module.prerequisite}`);
  }
  if (module.corequisite) {
    lines.push(`- **Corequisite:** ${module.corequisite}`);
  }
  if (module.preclusion) {
    lines.push(`- **Preclusion:** ${module.preclusion}`);
  }

  for (const sem of module.semesterData) {
    if (sem.examDate) {
      const duration = sem.examDuration ? ` (${sem.examDuration} min)` : '';
      lines.push(
        `- **${SEMESTER_NAMES[sem.semester] ?? `Semester ${sem.semester}`} exam:** ${sem.examDate}${duration}`,
      );
    }
  }

  if (module.description) {
    lines.push('');
    lines.push(module.description);
  }

  lines.push('');
  lines.push(
    '_Full structured data (timetable, prerequisite tree, etc.) is in the structured content of this result._',
  );

  return lines.join('\n');
}

/** Build a one-line snippet, preferring ES highlight fragments over raw description. */
function searchSnippet(hit: ModuleHit): string {
  const fragments = hit.highlight?.description;
  if (fragments?.length) {
    const joined = fragments.join(' … ').replaceAll('<mark>', '**').replaceAll('</mark>', '**');
    return ` — ${joined}`;
  }
  const desc = hit._source.description;
  return desc ? ` — ${desc.slice(0, 140)}${desc.length > 140 ? '…' : ''}` : '';
}

/** Human-readable summary of a search result set. */
export function formatSearchResults(
  query: string | undefined,
  total: number,
  hits: Array<ModuleHit>,
  appliedFilters?: string,
): string {
  const scope = query ? ` matching "${query}"` : '';
  const filters = appliedFilters ? ` [${appliedFilters}]` : '';

  if (hits.length === 0) {
    return `No modules found${scope}${filters} for AY ${config.academicYear}.`;
  }

  const header = `Found ${total} module(s)${scope}${filters} (showing ${hits.length}) for AY ${config.academicYear}:`;

  const items = hits.map((hit) => {
    const m = hit._source;
    const credits = m.moduleCredit ? ` · ${m.moduleCredit} MC` : '';
    return `- **${m.moduleCode}** ${m.title}${credits}${searchSnippet(hit)}`;
  });

  return [header, '', ...items, '', 'Use `get_module` with a module code for full details.'].join(
    '\n',
  );
}
