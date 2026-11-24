#!/usr/bin/env python3
import argparse
import re
import shutil
import sys
import tempfile
from pathlib import Path

import jpype
from tabula.backend import jar_path
from tabula.io import convert_into_by_batch


JAVA_HEAP_LIMIT = "-Xmx512m"
REPORT_TYPES = ("vacancy", "ug", "gd")


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
    pdf_dir: Path,
    csv_dir: Path,
    academic_year: str | None,
    semester: int | None,
    max_pdf_bytes: int,
) -> None:
    pdf_dir = pdf_dir.resolve()
    pdf_files = [
        pdf_file
        for report_type in REPORT_TYPES
        for round_number in range(4)
        if (pdf_file := pdf_dir / report_type / f"round_{round_number}.pdf").is_file()
    ]
    if not pdf_files:
        raise ValueError(f"No PDF files found in {pdf_dir}")

    csv_dir.mkdir(parents=True, exist_ok=True)
    jpype.startJVM(JAVA_HEAP_LIMIT, classpath=[jar_path()])

    with tempfile.TemporaryDirectory(prefix="tabula-", dir=csv_dir) as staging_dir:
        tmp_dir = Path(staging_dir)
        output_paths: dict[str, Path] = {}

        for pdf_file in pdf_files:
            if not pdf_file.resolve().is_relative_to(pdf_dir):
                raise ValueError(f"{pdf_file} points outside the PDF archive")
            if pdf_file.stat().st_size > max_pdf_bytes:
                print(
                    f"Skipping {pdf_file}: exceeds the {max_pdf_bytes}-byte PDF limit",
                    file=sys.stderr,
                )
                continue
            ensure_pdf(pdf_file)
            if academic_year is not None and not is_current_report(pdf_file, academic_year, semester):
                continue
            report_type = pdf_file.parent.name
            staged_file = tmp_dir / f"{report_type}-{pdf_file.name}"
            shutil.copy2(pdf_file, staged_file)
            output_paths[staged_file.with_suffix(".csv").name] = (
                csv_dir / report_type / pdf_file.with_suffix(".csv").name
            )

        if not output_paths:
            return

        convert_into_by_batch(
            str(tmp_dir),
            output_format="csv",
            pages="all",
            lattice=True,
            silent=True,
        )

        for csv_file in sorted(tmp_dir.glob("*.csv")):
            output_file = output_paths[csv_file.name]
            output_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(csv_file, output_file)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert CourseReg PDFs to CSVs")
    parser.add_argument("--pdf-dir", required=True, type=Path)
    parser.add_argument("--csv-dir", required=True, type=Path)
    parser.add_argument("--max-pdf-bytes", required=True, type=int)
    parser.add_argument("--academic-year")
    parser.add_argument("--semester", type=int, choices=(1, 2))
    args = parser.parse_args()

    if (args.academic_year is None) != (args.semester is None):
        parser.error("--academic-year and --semester must be provided together")

    convert_pdf_dir(args.pdf_dir, args.csv_dir, args.academic_year, args.semester, args.max_pdf_bytes)


if __name__ == "__main__":
    main()
