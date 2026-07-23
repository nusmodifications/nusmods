import { sumBy } from 'lodash-es';

import { ModuleCode } from 'types/modules';
import {
  ModuleMatcher,
  Programme,
  ProgrammeFulfilment,
  ProgrammeRequirement,
  ProgrammeType,
  RequirementFulfilment,
} from 'types/programmes';

export type ProgrammeModule = {
  moduleCode: ModuleCode;
  moduleCredit: number;
};

export const programmeTypeLabels: { [type in ProgrammeType]: string } = {
  specialisation: 'Specialisation',
  focusArea: 'Focus Area',
  minor: 'Minor',
};

// Requirements with an MC floor are expanded into ceil(minMCs / 4) slots for
// the matching step. 4 MCs is by far the most common module credit value, and
// is also what planner placeholders assume.
const MODAL_MODULE_CREDIT = 4;

function moduleLevel(moduleCode: ModuleCode): number | null {
  const match = moduleCode.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : null;
}

export function moduleMatchesMatcher(moduleCode: ModuleCode, matcher: ModuleMatcher): boolean {
  if (matcher.kind === 'modules') {
    return matcher.codes.includes(moduleCode);
  }

  const matchesPrefix = matcher.prefixes.some(
    // The prefix must be the module's entire department code, so it has to be
    // followed by the module's level digits
    (prefix) => moduleCode.startsWith(prefix) && /^\d/.test(moduleCode.slice(prefix.length)),
  );
  if (!matchesPrefix) return false;
  if (matcher.minLevel == null && matcher.maxLevel == null) return true;

  const level = moduleLevel(moduleCode);
  if (level == null) return false;
  return (
    (matcher.minLevel == null || level >= matcher.minLevel) &&
    (matcher.maxLevel == null || level <= matcher.maxLevel)
  );
}

export function moduleMatchesRequirement(
  moduleCode: ModuleCode,
  requirement: Pick<ProgrammeRequirement, 'matchers'>,
): boolean {
  return requirement.matchers.some((matcher) => moduleMatchesMatcher(moduleCode, matcher));
}

/**
 * Checks a set of planned modules against a programme's requirements.
 *
 * Within a programme each module is counted towards at most one requirement.
 * Modules are assigned to requirements using maximum bipartite matching
 * (Kuhn's augmenting path algorithm) over requirement "slots", so a module
 * that matches several requirements is routed to wherever it is needed.
 * This is exact when all modules are worth 4 MCs — the overwhelmingly common
 * case — and a good approximation otherwise, since a top-up pass fills any
 * MC floor left unmet by the slot approximation.
 */
export function checkProgramme(
  modules: ProgrammeModule[],
  programme: Programme,
): ProgrammeFulfilment {
  const { requirements } = programme;

  // Modules may appear in multiple semesters (e.g. failed and retaken), but
  // only count once. Sort by descending MC so that MC floors are met with as
  // few slots as possible, then by module code for determinism.
  const seen = new Set<ModuleCode>();
  const uniqueModules = modules
    .filter((module) => {
      if (seen.has(module.moduleCode)) return false;
      seen.add(module.moduleCode);
      return true;
    })
    .sort((a, b) => b.moduleCredit - a.moduleCredit || a.moduleCode.localeCompare(b.moduleCode));

  // Requirement indices each module can count towards
  const candidates = uniqueModules.map((module) => {
    const indices: number[] = [];
    requirements.forEach((requirement, index) => {
      if (moduleMatchesRequirement(module.moduleCode, requirement)) indices.push(index);
    });
    return indices;
  });

  // Expand each requirement's floor into slots. Requirements without floors
  // are elective pools and get no slots — they absorb leftovers below.
  const slotRequirement: number[] = [];
  const slotsByRequirement: number[][] = requirements.map((requirement, index) => {
    const count = Math.max(
      requirement.minModules ?? 0,
      Math.ceil((requirement.minMCs ?? 0) / MODAL_MODULE_CREDIT),
    );
    const slotIndices = [];
    for (let i = 0; i < count; i++) {
      slotIndices.push(slotRequirement.length);
      slotRequirement.push(index);
    }
    return slotIndices;
  });

  const slotOccupant: (number | null)[] = slotRequirement.map(() => null);
  const assignedRequirement: (number | null)[] = uniqueModules.map(() => null);

  // Kuhn's augmenting path: assign the module to a free slot, or displace an
  // occupant that can be re-seated elsewhere
  function tryAssign(moduleIndex: number, visited: Set<number>): boolean {
    for (const requirementIndex of candidates[moduleIndex]) {
      for (const slotIndex of slotsByRequirement[requirementIndex]) {
        if (visited.has(slotIndex)) continue;
        visited.add(slotIndex);

        const occupant = slotOccupant[slotIndex];
        if (occupant == null || tryAssign(occupant, visited)) {
          slotOccupant[slotIndex] = moduleIndex;
          assignedRequirement[moduleIndex] = requirementIndex;
          return true;
        }
      }
    }
    return false;
  }

  uniqueModules.forEach((_module, moduleIndex) => {
    if (candidates[moduleIndex].length > 0) tryAssign(moduleIndex, new Set());
  });

  const assignedModuleIndices: number[][] = requirements.map(() => []);
  assignedRequirement.forEach((requirementIndex, moduleIndex) => {
    if (requirementIndex != null) assignedModuleIndices[requirementIndex].push(moduleIndex);
  });

  const assignedMCs = (requirementIndex: number) =>
    sumBy(assignedModuleIndices[requirementIndex], (index) => uniqueModules[index].moduleCredit);

  // Top-up pass: slots underestimate MC floors when modules are worth less
  // than 4 MCs, so give unassigned matching modules to requirements whose
  // MC floor is still unmet
  requirements.forEach((requirement, requirementIndex) => {
    const minMCs = requirement.minMCs;
    if (!minMCs) return;
    let fulfilledMCs = assignedMCs(requirementIndex);
    uniqueModules.forEach((module, moduleIndex) => {
      if (fulfilledMCs >= minMCs) return;
      if (assignedRequirement[moduleIndex] != null) return;
      if (!candidates[moduleIndex].includes(requirementIndex)) return;
      assignedRequirement[moduleIndex] = requirementIndex;
      assignedModuleIndices[requirementIndex].push(moduleIndex);
      fulfilledMCs += module.moduleCredit;
    });
  });

  // Every remaining module that matches some requirement still counts
  // towards the programme's total MCs. Prefer floor-less elective pools —
  // they exist to absorb these modules.
  uniqueModules.forEach((_module, moduleIndex) => {
    if (assignedRequirement[moduleIndex] != null || candidates[moduleIndex].length === 0) return;
    const pool = candidates[moduleIndex].find(
      (index) => !requirements[index].minMCs && !requirements[index].minModules,
    );
    const target = pool ?? candidates[moduleIndex][0];
    assignedRequirement[moduleIndex] = target;
    assignedModuleIndices[target].push(moduleIndex);
  });

  const requirementFulfilments: RequirementFulfilment[] = requirements.map(
    (requirement, requirementIndex) => {
      const assignedModules = assignedModuleIndices[requirementIndex]
        .map((index) => uniqueModules[index].moduleCode)
        .sort();
      return {
        requirement,
        assignedModules,
        fulfilledMCs: assignedMCs(requirementIndex),
        satisfied:
          assignedModules.length >= (requirement.minModules ?? 0) &&
          assignedMCs(requirementIndex) >= (requirement.minMCs ?? 0),
      };
    },
  );

  const totalMCs = sumBy(requirementFulfilments, (fulfilment) => fulfilment.fulfilledMCs);

  return {
    programme,
    requirements: requirementFulfilments,
    totalMCs,
    satisfied:
      requirementFulfilments.every((fulfilment) => fulfilment.satisfied) &&
      (programme.totalMCs == null || totalMCs >= programme.totalMCs),
  };
}
