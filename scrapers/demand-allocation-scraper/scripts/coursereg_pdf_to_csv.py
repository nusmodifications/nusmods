#!/usr/bin/env python3
import argparse
import os
import re
import shutil
import sys
import tempfile
from pathlib import Path

import jpype
from tabula.backend import jar_path
from tabula.io import convert_into_by_batch


def ensure_pdf(pdf_file: Path) -> None:
    with pdf_file.open("rb") as file:
        if file.read(4) != b"%PDF":
            raise ValueError(f"{pdf_file} is not a PDF")


def is_current_report(pdf_file: Path, academic_year: str, semester: int) -> bool:
    document_class = jpype.JClass("org.apache.pdfbox.pdmodel.PDDocument")
    java_file = jpype.JClass("java.io.File")(str(pdf_file))
    with document_class.load(java_file) as document:
        stripper = jpype.JClass("org.apache.pdfbox.text.PDFTextStripper")()
        stripper.setEndPage(1)
        first_page = str(stripper.getText(document))

    period = re.search(r"Semester\s+([12])\s*,\s*AY\s*(\d{4}/\d{4})", first_page)
    if not period or period.groups() != (str(semester), academic_year):
        print(f"Skipping {pdf_file}: expected Semester {semester}, AY{academic_year}", file=sys.stderr)
        return False

    report_type = pdf_file.parent.name
    if report_type == "vacancy":
        return "Course Class Vacancy Report" in first_page

    round_number = pdf_file.stem.removeprefix("round_")
    career = {"ug": "Undergraduate", "gd": "Graduate"}[report_type]
    return f"{career} Courses, Select Courses (Round {round_number})" in first_page


def convert_pdf_dir(
    pdf_dir: Path, csv_dir: Path, academic_year: str | None, semester: int | None
) -> None:
    pdf_files = sorted(pdf_dir.rglob("*.pdf"))
    if not pdf_files:
        raise ValueError(f"No PDF files found in {pdf_dir}")

    csv_dir.mkdir(parents=True, exist_ok=True)
    if academic_year is not None:
        jpype.startJVM(classpath=[jar_path()])

    with tempfile.TemporaryDirectory(prefix="nusmods-demand-allocation-pdfs-") as tmp_dir_raw:
        tmp_dir = Path(tmp_dir_raw)

        for pdf_file in pdf_files:
            ensure_pdf(pdf_file)
            if academic_year is not None and not is_current_report(pdf_file, academic_year, semester):
                continue
            relative_path = pdf_file.relative_to(pdf_dir)
            encoded_name = str(relative_path).replace(os.sep, "||")
            shutil.copy2(pdf_file, tmp_dir / encoded_name)

        if not any(tmp_dir.iterdir()):
            return

        convert_into_by_batch(
            str(tmp_dir),
            output_format="csv",
            pages="all",
            lattice=True,
            silent=True,
        )

        for csv_file in sorted(tmp_dir.glob("*.csv")):
            relative_csv = Path(*csv_file.name.split("||")).with_suffix(".csv")
            output_file = csv_dir / relative_csv
            output_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(csv_file, output_file)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert CourseReg PDFs to CSVs")
    parser.add_argument("--pdf-dir", required=True, type=Path)
    parser.add_argument("--csv-dir", required=True, type=Path)
    parser.add_argument("--academic-year")
    parser.add_argument("--semester", type=int, choices=(1, 2))
    args = parser.parse_args()

    if (args.academic_year is None) != (args.semester is None):
        parser.error("--academic-year and --semester must be provided together")

    convert_pdf_dir(args.pdf_dir, args.csv_dir, args.academic_year, args.semester)


if __name__ == "__main__":
    main()
