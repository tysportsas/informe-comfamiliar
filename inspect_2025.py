import pandas as pd

try:
    xl = pd.ExcelFile('data_2025_recreacion.xlsx')
    print("Sheets in data_2025_recreacion.xlsx:", xl.sheet_names)
except Exception as e:
    print(f"Error: {e}")
