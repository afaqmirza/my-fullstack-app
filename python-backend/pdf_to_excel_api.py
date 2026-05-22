from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import pandas as pd
import pdfplumber

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)


def pdf_to_excel(pdf_path, excel_path):
    """
    Extract tables from PDF and convert to Excel.
    """
    all_data = []
    
    # Open the PDF and extract tables from each page
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if table:
                # If it's the first table, keep the header. Otherwise, append data.
                if not all_data:
                    all_data.extend(table)
                else:
                    # Skip header for subsequent tables if they match the first table's structure
                    all_data.extend(table[1:] if len(table) > 1 else table)
    
    if all_data:
        # Convert to pandas DataFrame and save as Excel
        df = pd.DataFrame(all_data[1:], columns=all_data[0])
        df.to_excel(excel_path, index=False)
        return True
    return False


@app.post("/convert-pdf-to-excel/")
async def convert_pdf_to_excel(file: UploadFile = File(...)):
    """
    Convert PDF file to Excel format.
    """
    print(f"[DEBUG] Received file: {file.filename}, Size: {file.size}, Content-Type: {file.content_type}")
    
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        error_msg = f"Invalid file type. File '{file.filename}' is not a PDF. Please upload a PDF file."
        print(f"[ERROR] {error_msg}")
        return JSONResponse(
            status_code=400,
            content={"error": error_msg}
        )
    
    # Create a temporary file to save the uploaded PDF
    temp_pdf_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.pdf")
    
    try:
        # Save the uploaded file
        content = await file.read()
        print(f"[DEBUG] Read {len(content)} bytes from file")
        
        with open(temp_pdf_path, "wb") as buffer:
            buffer.write(content)
        
        print(f"[DEBUG] Saved temp file to: {temp_pdf_path}")
        
        # Generate the Excel output filename
        excel_filename = f"{uuid.uuid4()}.xlsx"
        excel_path = os.path.join(OUTPUT_FOLDER, excel_filename)
        
        # Convert PDF to Excel
        print(f"[DEBUG] Converting PDF to Excel...")
        success = pdf_to_excel(temp_pdf_path, excel_path)
        
        if not success:
            os.remove(temp_pdf_path)
            error_msg = "No tables found in the provided PDF to convert."
            print(f"[ERROR] {error_msg}")
            return JSONResponse(
                status_code=400,
                content={"error": error_msg}
            )
        
        print(f"[DEBUG] Successfully converted to: {excel_path}")
        # Remove the temporary PDF file
        os.remove(temp_pdf_path)
        
        # Return the Excel file for download
        return FileResponse(
            excel_path,
            filename="converted.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)
        
        error_msg = f"Error during conversion: {str(e)}"
        print(f"[ERROR] {error_msg}")
        return JSONResponse(
            status_code=500,
            content={"error": error_msg}
        )
