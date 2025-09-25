#!/usr/bin/env python3
"""
Script to generate test datasets based on vanha_tutu_xs.xml structure.
Creates four different sized test files with randomly generated data.
"""

import xml.etree.ElementTree as ET
import random
import os
from datetime import datetime, timedelta
from typing import List, Dict, Tuple

def parse_metadata(xml_file_path: str) -> Tuple[List[Dict], str, str]:
    """Parse the XML file to extract field metadata and database info."""
    tree = ET.parse(xml_file_path)
    root = tree.getroot()
    
    # Extract database info
    database_elem = root.find('.//{http://www.filemaker.com/fmpxmlresult}DATABASE')
    date_format = database_elem.get('DATEFORMAT', 'D.m.yyyy')
    time_format = database_elem.get('TIMEFORMAT', 'k:mm:ss ')
    database_name = database_elem.get('NAME', 'tuttu.fmp12')
    layout = database_elem.get('LAYOUT', 'vl_esittelija')
    
    # Extract field metadata
    fields = []
    metadata_elem = root.find('.//{http://www.filemaker.com/fmpxmlresult}METADATA')
    
    for field_elem in metadata_elem.findall('.//{http://www.filemaker.com/fmpxmlresult}FIELD'):
        field_info = {
            'name': field_elem.get('NAME'),
            'type': field_elem.get('TYPE'),
            'empty_ok': field_elem.get('EMPTYOK', 'YES') == 'YES',
            'max_repeat': int(field_elem.get('MAXREPEAT', '1'))
        }
        fields.append(field_info)
    
    return fields, date_format, time_format

def generate_text_value() -> str:
    """Generate a random text value with 50% chance of being 'Teksti' or empty."""
    if random.random() < 0.5:
        return 'Teksti'
    return ''

def generate_number_value() -> str:
    """Generate a random number value with 50% chance of being 1-10 or empty."""
    if random.random() < 0.5:
        return str(random.randint(1, 10))
    return ''

def generate_date_value() -> str:
    """Generate a random date value with 50% chance or empty."""
    if random.random() < 0.5:
        # Generate a random date between 2020-01-01 and 2024-12-31
        start_date = datetime(2020, 1, 1)
        end_date = datetime(2024, 12, 31)
        random_date = start_date + timedelta(days=random.randint(0, (end_date - start_date).days))
        return random_date.strftime('%d.%m.%Y')
    return ''

def generate_field_value(field_info: Dict) -> str:
    """Generate a value for a field based on its type."""
    if not field_info['empty_ok'] or random.random() < 0.5:
        if field_info['type'] == 'TEXT':
            return generate_text_value()
        elif field_info['type'] == 'NUMBER':
            return generate_number_value()
        elif field_info['type'] == 'DATE':
            return generate_date_value()
        else:
            return generate_text_value()  # Default to text for unknown types
    return ''

def generate_xml_content(fields: List[Dict], record_count: int, date_format: str, time_format: str) -> str:
    """Generate the complete XML content for the test dataset."""
    
    # XML header and database info
    xml_content = f'''<?xml version="1.0" encoding="UTF-8" ?>
<FMPXMLRESULT xmlns="http://www.filemaker.com/fmpxmlresult">
      <ERRORCODE>0</ERRORCODE>
      <PRODUCT BUILD="09-05-2019" NAME="FileMaker" VERSION="ProAdvanced 18.0.3"/>
      <DATABASE DATEFORMAT="{date_format}" LAYOUT="vl_esittelija" NAME="tuttu.fmp12" RECORDS="{record_count}" TIMEFORMAT="{time_format}"/>
      <METADATA>
'''
    
    # Add field metadata
    for field in fields:
        xml_content += f'            <FIELD EMPTYOK="YES" MAXREPEAT="1" NAME="{field["name"]}" TYPE="{field["type"]}"/>\n'
    
    xml_content += '      </METADATA>\n'
    xml_content += f'      <RESULTSET FOUND="{record_count}">\n'
    
    # Generate records
    for i in range(record_count):
        modid = random.randint(100, 999)
        recordid = random.randint(25000, 99999)
        xml_content += f'            <ROW MODID="{modid}" RECORDID="{recordid}">\n'
        
        for field in fields:
            value = generate_field_value(field)
            xml_content += '                  <COL>\n'
            xml_content += f'                        <DATA>{value}</DATA>\n'
            xml_content += '                  </COL>\n'
        
        xml_content += '            </ROW>\n'
    
    xml_content += '      </RESULTSET>\n'
    xml_content += '</FMPXMLRESULT>\n'
    
    return xml_content

def main():
    """Main function to generate all test datasets."""
    # Set random seed for reproducible results
    random.seed(42)
    
    # Path to the original XML file (relative to script location)
    original_xml_path = 'tutu-backend/src/main/resources/filemaker-migration/vanha_tutu_xs.xml'
    
    # Output directory (relative to script location)
    output_dir = 'tutu-backend/src/main/resources/filemaker-migration'
    
    print("Parsing metadata from original XML file...")
    fields, date_format, time_format = parse_metadata(original_xml_path)
    print(f"Found {len(fields)} fields")
    
    # Define the test datasets to generate
    datasets = [
        ('vanha_tutu_s.xml', 20),
        ('vanha_tutu_m.xml', 200),
        ('vanha_tutu_l.xml', 2000),
        ('vana_tutu_xl.xml', 10000)
    ]
    
    for filename, record_count in datasets:
        print(f"Generating {filename} with {record_count} records...")
        
        # Generate XML content
        xml_content = generate_xml_content(fields, record_count, date_format, time_format)
        
        # Write to file
        output_path = os.path.join(output_dir, filename)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(xml_content)
        
        print(f"Created {output_path}")
    
    print("All test datasets generated successfully!")

if __name__ == "__main__":
    main()
