# Demand Allocation Scraper

This scraper builds CourseReg demand allocation and vacancy history for the NUSMods API.

The scraper reads CourseReg PDFs and writes to the shared NUSMods API data directory.

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

The scraper uses `.venv/bin/python` when present and falls back to `python3`. Automatic downloads also require an installed Google Chrome. Set `CHROME_EXECUTABLE_PATH` to use an alternate Chrome or Chromium executable.

## Scheduled refresh

The regular `nus-v2` job checks every round for the configured semester after it finishes refreshing the main NUS data. On that host, install Chrome and Java, expose `JAVA_HOME` to the job, and create the Python environment above at `.venv` in this package. A skipped or failed CourseReg refresh is logged separately.

Every run creates a fresh Chrome profile under the system temporary directory and removes it along with the working PDFs and CSVs when the run ends. A successful round refresh replaces the saved PDF and CSV for each report type at fixed paths for that semester.

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

`archive/pdfs/` is gitignored. Set `COURSE_REG_ARCHIVE_DIR` to use a different archive root, such as a persistent mount. The scraper appends the academic year and semester to that root.

To import the PDFs from an existing CourseRekt checkout, run the import script.

```sh
python3 scripts/import_courserekt_pdfs.py /path/to/courserekt
```

## Download the current semester

Run `all` from this package to use the academic year and semester in [the shared scraper config](../../packages/nusmods-academic-calendar/scraper-period.json).

```sh
pnpm dev all
```

Headless Chrome opens the public report URLs directly. The scraper checks the period printed in each report and updates rounds with all three reports for that period. Previously generated rounds are preserved if their reports are unavailable. If no complete round is available, the command fails and leaves the existing JSON intact.

Either command accepts `--output-dir /tmp/course-reg-api` to write the academic-year output to a separate directory while testing.

## Run from staged PDFs

Stage PDFs in the archive layout above, then import the available rounds for that semester. Existing history is preserved for rounds absent from the input.

```sh
pnpm dev import 2 2025/2026
```

## Data Semantics

Class identity is keyed by course/module code plus class code. Titles and departments from the PDFs are not used as identifiers because they can vary or be repeated.

Slot values in the generated JSON are non-negative integers, `"unlimited"`, or `"notAvailable"`. `0` is preserved as a real slot count; `"unlimited"` represents uncapped vacancies; `"notAvailable"` represents a class or student type that is not listed for that round/report.
