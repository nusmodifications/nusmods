# Demand Allocation Scraper

This scraper builds CourseReg demand allocation and vacancy history for the NUSMods API.

The scraper is intentionally separate from `scrapers/nus-v2` because it works from CourseReg PDFs rather than the module/timetable APIs. It still writes generated API data into the NUS v2 data tree:

```text
../nus-v2/data/<acad-year>/semesters/<semester>/courseRegHistory.json
```

## Setup

Install workspace dependencies from the repository root:

```sh
pnpm install
```

PDF conversion requires Python with `tabula-py` installed and Java available through `JAVA_HOME`.

## Source PDF Archive

NUS CourseReg PDFs are not reliably downloadable with a plain scraper request because NUS may return an HTML bot-protection page instead of PDF bytes. Treat the PDFs as manual/operator input unless NUS provides a supported download path.

Store source PDFs under:

```text
archive/pdfs/<acad-year>/semesters/<semester>/
  vacancy/round_<round>.pdf
  ug/round_<round>.pdf
  gd/round_<round>.pdf
```

For example:

```text
archive/pdfs/2025-2026/semesters/2/vacancy/round_1.pdf
archive/pdfs/2025-2026/semesters/2/ug/round_1.pdf
archive/pdfs/2025-2026/semesters/2/gd/round_1.pdf
```

`archive/pdfs/` is gitignored. Generated JSON belongs under `../nus-v2/data/` and is the only CourseReg artifact intended for the public API sync.

To import an existing CourseRekt checkout into this archive layout:

```sh
python3 scripts/import_courserekt_pdfs.py /path/to/courserekt
```

## Run

Build CourseReg history after manually staging one newly released round:

```sh
JAVA_HOME=/path/to/java \
pnpm dev 2 2025/2026 \
  --round 1 \
  --pdfDir archive/pdfs/2025-2026/semesters/2
```

By default, output goes to:

```text
../nus-v2/data/2025-2026/semesters/2/courseRegHistory.json
```

When `--round` is provided, the scraper updates that round in the existing
`courseRegHistory.json` if one exists, while preserving previously scraped rounds.
Classes that existed in earlier rounds but are missing from the newly scraped
round are recorded as `"notAvailable"` for that round.

To rebuild all available rounds from staged PDFs, omit `--round`:

```sh
JAVA_HOME=/path/to/java \
pnpm dev 2 2025/2026 \
  --pdfDir archive/pdfs/2025-2026/semesters/2
```

To test against a temporary output directory:

```sh
JAVA_HOME=/path/to/java \
pnpm dev 2 2025/2026 \
  --round 1 \
  --pdfDir archive/pdfs/2025-2026/semesters/2 \
  --inputDir /tmp/demand-allocation-csv \
  --outputDir /tmp/demand-allocation-output
```

## Data Semantics

Class identity is keyed by course/module code plus class code. Titles and departments from the PDFs are not used as identifiers because they can vary or be repeated.

Slot values in the generated JSON are non-negative integers, `"unlimited"`, or `"notAvailable"`. `0` is preserved as a real slot count; `"unlimited"` represents uncapped vacancies; `"notAvailable"` represents a class or student type that is not listed for that round/report.
