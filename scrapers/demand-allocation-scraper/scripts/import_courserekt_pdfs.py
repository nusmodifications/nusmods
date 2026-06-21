#!/usr/bin/env python3
import argparse
import shutil
from pathlib import Path


def academic_year_path(short_year: str) -> str:
    if len(short_year) != 4 or not short_year.isdigit():
        raise ValueError(f"Expected CourseRekt academic year like 2223, got {short_year}")

    start = 2000 + int(short_year[:2])
    end = 2000 + int(short_year[2:])
    return f"{start}-{end}"


def ensure_pdf(pdf_file: Path) -> None:
    with pdf_file.open("rb") as file:
        if file.read(4) != b"%PDF":
            raise ValueError(f"{pdf_file} is not a PDF")


def copy_pdf(source_file: Path, output_file: Path) -> None:
    ensure_pdf(source_file)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source_file, output_file)


def import_courserekt_pdfs(courserekt_dir: Path, output_dir: Path) -> int:
    history_dir = courserekt_dir / "src" / "history"
    coursereg_pdf_dir = history_dir / "coursereg_history" / "data" / "pdfs"
    vacancy_pdf_dir = history_dir / "vacancy_history" / "data" / "pdfs"

    if not coursereg_pdf_dir.exists() or not vacancy_pdf_dir.exists():
        raise ValueError(
            "CourseRekt PDF archive not found. Expected "
            "src/history/{coursereg_history,vacancy_history}/data/pdfs under "
            f"{courserekt_dir}"
        )

    copied = 0

    for source_file in sorted(coursereg_pdf_dir.glob("*/*/*/round_*.pdf")):
        short_year, semester, student_type, file_name = source_file.relative_to(
            coursereg_pdf_dir
        ).parts
        copy_pdf(
            source_file,
            output_dir
            / academic_year_path(short_year)
            / "semesters"
            / semester
            / student_type
            / file_name,
        )
        copied += 1

    for source_file in sorted(vacancy_pdf_dir.glob("*/*/round_*.pdf")):
        short_year, semester, file_name = source_file.relative_to(vacancy_pdf_dir).parts
        copy_pdf(
            source_file,
            output_dir
            / academic_year_path(short_year)
            / "semesters"
            / semester
            / "vacancy"
            / file_name,
        )
        copied += 1

    return copied


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import CourseRekt PDF archives into the demand allocation scraper archive"
    )
    parser.add_argument(
        "courserekt_dir",
        type=Path,
        help="path to a local CourseRekt checkout",
    )
    parser.add_argument(
        "--output-dir",
        default=Path(__file__).resolve().parents[1] / "archive" / "pdfs",
        type=Path,
        help="output CourseReg PDF archive directory",
    )
    args = parser.parse_args()

    copied = import_courserekt_pdfs(args.courserekt_dir, args.output_dir)
    print(f"Imported {copied} PDFs into {args.output_dir}")


if __name__ == "__main__":
    main()
