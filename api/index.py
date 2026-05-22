import sys
import os
import shutil
import uuid
import json
import traceback
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import FastAPI, Request, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Add python-backend directory to system path to import modules
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PYTHON_BACKEND_DIR = os.path.join(ROOT_DIR, "python-backend")
sys.path.append(PYTHON_BACKEND_DIR)
sys.path.append(ROOT_DIR)

# Import workers directly
from worker import process_task
from qr_api import decode_qr, generate_qr

app = FastAPI()

# Enable CORS (same as local development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Saved-Percent"]
)

# Helper function to remove temporary files after download
def remove_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        print(f"Error removing temp file {path}: {e}")

@app.get("/api")
@app.get("/api/")
def api_home():
    return {
        "success": True,
        "message": "Python Unified Backend running on Vercel"
    }

@app.post("/api/execute")
async def execute(request: Request, background_tasks: BackgroundTasks):
    try:
        form = await request.form()
    except Exception as e:
        return JSONResponse({"error": f"Failed to parse form-data: {str(e)}"}, status_code=400)
        
    task = form.get("task")
    if not task:
        task = request.query_params.get("task")
        
    if not task:
        return JSONResponse({"error": "Task name is required"}, status_code=400)
        
    temp_dir = "/tmp" if os.environ.get("VERCEL") else os.path.join(ROOT_DIR, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    
    files_list = []
    args = {}
    
    # Extract files and text arguments.
    # We want to preserve the order, especially placing 'file' first if it exists.
    for key, value in form.multi_items():
        if isinstance(value, UploadFile):
            if value.filename:
                file_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{value.filename}")
                with open(file_path, "wb") as f:
                    shutil.copyfileobj(value.file, f)
                
                # If key is 'file', insert it at the start, otherwise append
                if key == "file":
                    files_list.insert(0, file_path)
                else:
                    files_list.append(file_path)
        else:
            if key != "task":
                args[key] = value
                
    try:
        # Process the task in-process (avoiding subprocess spawn on Vercel)
        result = process_task(task, files_list, args, temp_dir)
        
        # Clean up input files immediately
        for file_path in files_list:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception:
                pass
                
        if isinstance(result, dict):
            return JSONResponse(result)
            
        elif isinstance(result, str) and os.path.exists(result):
            filename = os.path.basename(result)
            if "_" in filename:
                filename = filename.split("_", 1)[1]
                
            headers = {
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition, X-Saved-Percent"
            }
            
            ext = os.path.splitext(result)[1].lower()
            media_type = "application/octet-stream"
            if ext == ".pdf":
                media_type = "application/pdf"
            elif ext == ".docx":
                media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            elif ext == ".xlsx":
                media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            elif ext == ".pptx":
                media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            elif ext == ".zip":
                media_type = "application/zip"
                
            # Delete output file after response is sent
            background_tasks.add_task(remove_file, result)
            
            return FileResponse(result, media_type=media_type, filename=filename, headers=headers)
            
        else:
            return JSONResponse({"error": "Output file was not generated or is invalid"}, status_code=500)
            
    except Exception as e:
        # Clean up input files in case of error
        for file_path in files_list:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception:
                pass
        return JSONResponse({
            "error": str(e),
            "traceback": traceback.format_exc()
        }, status_code=500)

@app.post("/api/qr/decode")
async def decode_qr_endpoint(image: UploadFile = File(...)):
    temp_dir = "/tmp" if os.environ.get("VERCEL") else os.path.join(ROOT_DIR, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    
    file_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{image.filename}")
    try:
        with open(file_path, "wb") as f:
            shutil.copyfileobj(image.file, f)
            
        result = decode_qr(file_path)
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

@app.post("/api/qr/generate")
async def generate_qr_endpoint(request: Request, background_tasks: BackgroundTasks):
    try:
        body = await request.json()
    except Exception:
        body = {}
        
    text = body.get("text")
    if not text or not text.strip():
        return JSONResponse({"error": "No text/URL provided."}, status_code=400)
        
    size = int(body.get("size", 10))
    border = int(body.get("border", 4))
    fill_color = body.get("fill_color", "black")
    back_color = body.get("back_color", "white")
    fmt = body.get("format", "png")
    
    temp_dir = "/tmp" if os.environ.get("VERCEL") else os.path.join(ROOT_DIR, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    
    ext = ".svg" if fmt == "svg" else ".png"
    output_path = os.path.join(temp_dir, f"{uuid.uuid4()}_qr{ext}")
    
    try:
        result = generate_qr(
            text=text,
            size=size,
            border=border,
            fill_color=fill_color,
            back_color=back_color,
            fmt=fmt,
            output_path=output_path
        )
        
        if result.get("success") and os.path.exists(output_path):
            media_type = "image/svg+xml" if fmt == "svg" else "image/png"
            headers = {
                "Content-Disposition": f'attachment; filename="qr_code{ext}"'
            }
            background_tasks.add_task(remove_file, output_path)
            return FileResponse(output_path, media_type=media_type, headers=headers)
        else:
            return JSONResponse({"error": "QR code file generation failed"}, status_code=500)
            
    except Exception as e:
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except Exception:
                pass
        return JSONResponse({"error": str(e)}, status_code=500)

@app.post("/api/contact")
async def contact_endpoint(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid request body"}, status_code=400)
        
    name = body.get("name")
    email = body.get("email")
    subject = body.get("subject")
    message = body.get("message")
    
    if not name or not name.strip() or not email or not email.strip() or not subject or not subject.strip() or not message or not message.strip():
        return JSONResponse({"error": "Please fill in all fields."}, status_code=400)
        
    email_regex = r"^[^\s@]+@[^\s@]+\.[^\s@]+$"
    if not re.match(email_regex, email):
        return JSONResponse({"error": "Please enter a valid email address."}, status_code=400)
        
    to_email = os.environ.get("CONTACT_TO_EMAIL", "afaqmugha754@gmail.com")
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASS")
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port_str = os.environ.get("SMTP_PORT", "587")
    smtp_secure = os.environ.get("SMTP_SECURE") == "true"
    
    if not smtp_user or not smtp_pass:
        return JSONResponse({
            "error": "Email is not configured on the server. Add SMTP_USER and SMTP_PASS to your .env file (Gmail App Password recommended)."
        }, status_code=503)
        
    try:
        smtp_port = int(smtp_port_str)
    except ValueError:
        smtp_port = 587
        
    try:
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"[Website Contact] {subject}"
        msg['From'] = f'"ZeroWaveLabs Contact" <{smtp_user}>'
        msg['To'] = to_email
        msg.add_header('reply-to', email)
        
        text_content = f"Name: {name}\nReply-To: {email}\nSubject: {subject}\n\n{message}"
        html_message = message.replace('\n', '<br>')
        html_content = f"""
        <h2>New contact message</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
        <p><strong>Subject:</strong> {subject}</p>
        <hr>
        <p>{html_message}</p>
        """
        
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        if smtp_secure:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
            
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, to_email, msg.as_string())
        server.quit()
        
        return JSONResponse({"success": True, "message": "Your message was sent successfully."})
        
    except Exception as e:
        return JSONResponse({"error": f"Failed to send email: {str(e)}"}, status_code=500)
