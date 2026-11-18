# Demand Allocation PDF Archive

This directory holds downloaded and operator-staged CourseReg source PDFs used by the demand
allocation scraper.

PDFs use this layout.

```text
archive/pdfs/<acad-year>/semesters/<semester>/
  vacancy/round_<round>.pdf
  ug/round_<round>.pdf
  gd/round_<round>.pdf
```

The PDF files are ignored by git. Generated API data is written separately to
`../data/<acad-year>/semesters/<semester>/courseRegHistory.json`.
