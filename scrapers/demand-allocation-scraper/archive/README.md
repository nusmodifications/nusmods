# Demand Allocation PDF Archive

This directory is for operator-staged CourseReg source PDFs used by the demand
allocation scraper.

PDFs should be stored under:

```text
archive/pdfs/<acad-year>/semesters/<semester>/
  vacancy/round_<round>.pdf
  ug/round_<round>.pdf
  gd/round_<round>.pdf
```

The PDF files are ignored by git. Generated API data is written separately to
`../nus-v2/data/<acad-year>/semesters/<semester>/courseRegHistory.json`.
