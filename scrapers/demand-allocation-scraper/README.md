# Demand Allocation Scraper

This scraper builds CourseReg demand allocation and vacancy history for the NUSMods API.

The scraper is intentionally separate from `scrapers/nus-v2` because it works from CourseReg PDFs rather than the module/timetable APIs. It still writes generated API data into the NUS v2 data tree:

```text
../data/<acad-year>/semesters/<semester>/courseRegHistory.json
```

## Setup

Install workspace dependencies from the repository root:

```sh
pnpm install
```

PDF conversion requires Java available through `JAVA_HOME` and a Python environment with the pinned dependencies:

```sh
cd scrapers/demand-allocation-scraper
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Then pass the pinned environment to scraper runs with `--python .venv/bin/python`. Automatic downloads also require an installed Google Chrome. Set `CHROME_EXECUTABLE_PATH` to use an alternate Chrome or Chromium executable.

## Source PDF Archive

The scraper archives downloaded reports in this layout. Use the same layout for manually staged reports.

```text
archive/pdfs/<acad-year>/semesters/<semester>/
  vacancy/round_<round>.pdf
  ug/round_<round>.pdf
  gd/round_<round>.pdf
```

For AY2025/26 Semester 2, Round 1 uses these paths.

```text
archive/pdfs/2025-2026/semesters/2/vacancy/round_1.pdf
archive/pdfs/2025-2026/semesters/2/ug/round_1.pdf
archive/pdfs/2025-2026/semesters/2/gd/round_1.pdf
```

`archive/pdfs/` is gitignored. Use `--archiveDir` to archive the PDFs in a persistent directory for the target academic year and semester.

To import the PDFs from an existing CourseRekt checkout, run the import script.

```sh
python3 scripts/import_courserekt_pdfs.py /path/to/courserekt
```

## Download the current semester

Run from this package with no positional arguments to use the academic year and semester in [the shared scraper config](../../packages/nusmods-academic-calendar/scraper-period.json).

```sh
JAVA_HOME=/path/to/java pnpm dev --python .venv/bin/python
```

Headless Chrome opens the public report URLs directly. The scraper checks the period printed in each report and updates rounds with all three reports for that period. Previously generated rounds are preserved if their reports are unavailable. If no complete round is available, the command fails and leaves the existing JSON intact.

Add `--round 3` to refresh a single round or `--outputDir /tmp/course-reg-api` to write to a separate directory while testing. The `--download` flag enables the same download mode when specifying an explicit semester and academic year.

## Run from staged PDFs

Build CourseReg history after manually staging one newly released round.

```sh
JAVA_HOME=/path/to/java \
pnpm dev 2 2025/2026 \
  --round 1 \
  --pdfDir archive/pdfs/2025-2026/semesters/2 \
  --python .venv/bin/python
```

When `--round` is provided, the scraper updates that round in the existing
`courseRegHistory.json` if one exists, while preserving previously scraped rounds.
Classes that existed in earlier rounds but are missing from the newly scraped
round are recorded as `"notAvailable"` for that round.

To rebuild all available rounds from staged PDFs, omit `--round`.

```sh
JAVA_HOME=/path/to/java \
pnpm dev 2 2025/2026 \
  --pdfDir archive/pdfs/2025-2026/semesters/2 \
  --python .venv/bin/python
```

To test against a temporary output directory, provide `--outputDir`.

```sh
JAVA_HOME=/path/to/java \
pnpm dev 2 2025/2026 \
  --round 1 \
  --pdfDir archive/pdfs/2025-2026/semesters/2 \
  --inputDir /tmp/demand-allocation-csv \
  --outputDir /tmp/demand-allocation-output \
  --python .venv/bin/python
```

## Data Semantics

Class identity is keyed by course/module code plus class code. Titles and departments from the PDFs are not used as identifiers because they can vary or be repeated.

Slot values in the generated JSON are non-negative integers, `"unlimited"`, or `"notAvailable"`. `0` is preserved as a real slot count; `"unlimited"` represents uncapped vacancies; `"notAvailable"` represents a class or student type that is not listed for that round/report.
