"""DATA - Carga de datos desde JSON"""
import json
from pathlib import Path

sensores = json.load(open(Path(__file__).parent / '../data/sensores.json', encoding='utf-8-sig'))
lecturas = json.load(open(Path(__file__).parent / '../data/lecturas.json', encoding='utf-8-sig'))
vehiculos = json.load(open(Path(__file__).parent / '../data/vehiculos.json', encoding='utf-8-sig'))
