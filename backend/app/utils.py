import os

def save_upload_file_tmp(upload_file) -> str:
    """Save UploadFile (FastAPI) to a temporary file and return path."""
    import tempfile
    suffix = os.path.splitext(upload_file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = upload_file.file.read()
        tmp.write(content)
        tmp_path = tmp.name
    return tmp_path