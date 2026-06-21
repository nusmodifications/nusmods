#!/usr/bin/env python3
import argparse
import os
import shutil
import tempfile
from pathlib import Path

from tabula.io import convert_into_by_batch


def ensure_pdf(pdf_file: Path) -> None:
    with pdf_file.open("rb") as file:
        if file.read(4) != b"%PDF":
            raise ValueError(f"{pdf_file} is not a PDF")


def convert_pdf_dir(pdf_dir: Path, csv_dir: Path) -> None:
    pdf_files = sorted(pdf_dir.rglob("*.pdf"))
    if not pdf_files:
        raise ValueError(f"No PDF files found in {pdf_dir}")

    csv_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="nusmods-demand-allocation-pdfs-") as tmp_dir_raw:
        tmp_dir = Path(tmp_dir_raw)

        for pdf_file in pdf_files:
            ensure_pdf(pdf_file)
            relative_path = pdf_file.relative_to(pdf_dir)
            encoded_name = str(relative_path).replace(os.sep, "||")
            shutil.copy2(pdf_file, tmp_dir / encoded_name)

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
    args = parser.parse_args()

    convert_pdf_dir(args.pdf_dir, args.csv_dir)


if __name__ == "__main__":
    main()
