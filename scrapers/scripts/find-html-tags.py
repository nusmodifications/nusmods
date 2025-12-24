#!/usr/bin/env python3
"""
Script to find all unique HTML tags (excluding plain <p> tags) in api-calls.log
and identify which fields they belong to.
"""

import json
import re
import sys
from pathlib import Path
from collections import defaultdict

# Pattern to match HTML tags
# Matches: <tag>, <tag attr="value">, </tag>, <tag/>
HTML_TAG_PATTERN = re.compile(r'</?([a-zA-Z][a-zA-Z0-9]*)[^>]*>')

# Pattern to match plain <p> tags (no attributes, just <p> or </p>)
PLAIN_P_TAG_PATTERN = re.compile(r'</?p\s*>', re.IGNORECASE)


def extract_field_data(log_file_path):
    """Extract all field data from the log file, tracking which fields contain HTML."""
    # field_data: {field_name: [list of field values]}
    field_data = defaultdict(list)
    
    with open(log_file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            
            try:
                entry = json.loads(line)
                # Navigate to response.data.data array
                if 'response' in entry and entry['response']:
                    response_data = entry['response'].get('data', {})
                    if isinstance(response_data, dict) and 'data' in response_data:
                        data_array = response_data['data']
                        if isinstance(data_array, list):
                            for item in data_array:
                                if item and isinstance(item, dict):
                                    # Check all fields in the item
                                    for field_name, field_value in item.items():
                                        # Only process string values
                                        if isinstance(field_value, str) and field_value:
                                            field_data[field_name].append(field_value)
            except json.JSONDecodeError as e:
                print(f"Warning: Failed to parse line {line_num}: {e}", file=sys.stderr)
                continue
    
    return field_data


def find_html_tags(text):
    """Find all HTML tags in the given text."""
    tags = set()
    for match in HTML_TAG_PATTERN.finditer(text):
        tag_name = match.group(1).lower()
        full_tag = match.group(0)
        
        # Skip plain <p> tags (no attributes)
        if tag_name == 'p' and PLAIN_P_TAG_PATTERN.match(full_tag):
            continue
        
        tags.add((tag_name, full_tag))
    
    return tags


def main():
    log_file = Path(__file__).parent.parent / 'logs' / 'api-calls.log'
    
    if not log_file.exists():
        print(f"Error: Log file not found at {log_file}", file=sys.stderr)
        sys.exit(1)
    
    # Fields that are used in scraper output (mapped from API to Module type)
    # Based on GetSemesterData.ts mapModuleInfo function
    fields_used_in_output = {
        'Description': 'description',
        'AdditionalInformation': 'additionalInformation',
        'PreRequisiteAdvisory': 'prerequisiteAdvisory',
        'CatalogNumber': 'moduleCode (combined with Subject)',
        'Subject': 'moduleCode (combined with CatalogNumber)',
        'WorkLoadHours': 'workload',
        'CourseTitle': 'title',
        'Preclusion': 'preclusion',
        'PreclusionRule': 'preclusionRule',
        'PreRequisite': 'prerequisite',
        'PreRequisiteRule': 'prerequisiteRule',
        'CoRequisite': 'corequisite',
        'CoRequisiteRule': 'corequisiteRule',
        'ModularCredit': 'moduleCredit',
        'GradingBasisDesc': 'gradingBasisDescription',
    }
    
    print(f"Reading log file: {log_file}")
    print("Extracting field data...")
    
    field_data = extract_field_data(log_file)
    print(f"Found {len(field_data)} unique fields\n")
    
    # Track tags by field: {field_name: {tag_name: set of full_tags}}
    tags_by_field = defaultdict(lambda: defaultdict(set))
    # Track examples: {field_name: {tag_name: [examples]}}
    tag_examples_by_field = defaultdict(lambda: defaultdict(list))
    
    # Check each field for HTML tags
    for field_name, field_values in field_data.items():
        for value in field_values:
            tags = find_html_tags(value)
            for tag_name, full_tag in tags:
                tags_by_field[field_name][tag_name].add(full_tag)
                # Store up to 3 examples per tag per field
                if len(tag_examples_by_field[field_name][tag_name]) < 3:
                    tag_examples_by_field[field_name][tag_name].append(full_tag)
    
    # Filter to only fields that contain HTML tags
    fields_with_html = {
        field: tags for field, tags in tags_by_field.items() 
        if tags  # Only include fields that have tags
    }
    
    # Show ALL fields found first
    print("=" * 80)
    print("ALL FIELDS FOUND IN LOG FILE:")
    print("=" * 80)
    print()
    
    for field_name in sorted(field_data.keys()):
        has_html = field_name in fields_with_html
        used_in_output = field_name in fields_used_in_output
        status_parts = []
        if has_html:
            status_parts.append("HAS HTML")
        if used_in_output:
            status_parts.append(f"USED → {fields_used_in_output[field_name]}")
        status = " | ".join(status_parts) if status_parts else "NOT USED"
        print(f"  {field_name:30} [{status}]")
    
    print()
    print("=" * 80)
    print("HTML Tags Found by Field (excluding plain <p> tags):")
    print("=" * 80)
    print()
    
    if not fields_with_html:
        print("No HTML tags found in any fields.")
        return
    
    # Sort fields alphabetically
    for field_name in sorted(fields_with_html.keys()):
        field_tags = tags_by_field[field_name]
        total_tag_variants = sum(len(tags) for tags in field_tags.values())
        total_tag_types = len(field_tags)
        output_mapping = fields_used_in_output.get(field_name, "NOT USED")
        
        print(f"Field: {field_name} → {output_mapping}")
        print(f"  Found {total_tag_types} tag types with {total_tag_variants} unique variants")
        print()
        
        # Sort tags by tag name
        sorted_tag_names = sorted(field_tags.keys())
        for tag_name in sorted_tag_names:
            full_tags = sorted(field_tags[tag_name])
            print(f"  Tag: <{tag_name}> ({len(full_tags)} variant(s))")
            
            # Show examples
            examples = tag_examples_by_field[field_name][tag_name]
            if examples:
                print(f"    Examples:")
                for example in examples[:3]:  # Show up to 3 examples
                    print(f"      {example}")
            
            # Show all variants if there are more than examples shown
            if len(full_tags) > len(examples):
                remaining = [t for t in full_tags if t not in examples]
                if len(remaining) <= 5:  # Show all if 5 or fewer
                    for variant in remaining:
                        print(f"      {variant}")
                else:  # Show first 5 if more
                    for variant in remaining[:5]:
                        print(f"      {variant}")
                    print(f"      ... and {len(remaining) - 5} more variant(s)")
            print()
        
        print("-" * 80)
        print()
    
    # Summary
    all_unique_tags = set()
    for field_tags in tags_by_field.values():
        for tag_name, full_tags in field_tags.items():
            for full_tag in full_tags:
                all_unique_tags.add((tag_name, full_tag))
    
    fields_with_html_used = [f for f in fields_with_html.keys() if f in fields_used_in_output]
    
    print("=" * 80)
    print("Summary:")
    print(f"  Total fields found: {len(field_data)}")
    print(f"  Fields with HTML tags: {len(fields_with_html)}")
    print(f"  Fields with HTML that are USED in output: {len(fields_with_html_used)}")
    print(f"    {', '.join(fields_with_html_used)}")
    print(f"  Fields with HTML that are NOT USED: {len(fields_with_html) - len(fields_with_html_used)}")
    if len(fields_with_html) > len(fields_with_html_used):
        unused = [f for f in fields_with_html.keys() if f not in fields_used_in_output]
        print(f"    {', '.join(unused)}")
    print(f"  Total unique tag types: {len(set(t[0] for t in all_unique_tags))}")
    print(f"  Total unique tag variants: {len(all_unique_tags)}")
    print("=" * 80)


if __name__ == '__main__':
    main()

