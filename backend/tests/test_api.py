"""Tests for the FastAPI API endpoints."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _make_simple_pdf_bytes() -> bytes:
    """Create a minimal valid PDF for testing."""
    import fitz

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(
        (72, 72),
        "RENTAL AGREEMENT\n\n"
        "This agreement is between Owner and Tenant.\n"
        "Monthly rent is $1500. Late fee is $50.\n"
        "Lease term: January 1 to December 31, 2025.",
    )
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


SAMPLE_TXT = (
    "RENTAL AGREEMENT\n\n"
    "This agreement is between Owner and Tenant.\n"
    "Monthly rent is $1500. Late fee is $50.\n"
    "Lease term: January 1 to December 31, 2025.\n"
)


class TestHealthEndpoint:
    def test_health_returns_200(self):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert "status" in data
        assert "model_available" in data
        assert "model_name" in data


class TestPrivacyEndpoint:
    def test_privacy_returns_200(self):
        resp = client.get("/api/privacy")
        assert resp.status_code == 200
        data = resp.json()
        assert data["no_cloud_fallback"] is True
        assert data["session_cleanup_available"] is True


class TestUploadEndpoint:
    def test_upload_txt(self):
        resp = client.post(
            "/api/upload",
            files={"file": ("contract.txt", SAMPLE_TXT.encode(), "text/plain")},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "session_id" in data
        assert data["extraction"]["file_type"] == "txt"
        assert len(data["extraction"]["spans"]) > 0

    def test_upload_pdf(self):
        pdf_bytes = _make_simple_pdf_bytes()
        resp = client.post(
            "/api/upload",
            files={"file": ("contract.pdf", pdf_bytes, "application/pdf")},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "session_id" in data
        assert data["extraction"]["file_type"] == "pdf"

    def test_upload_unsupported_type(self):
        resp = client.post(
            "/api/upload",
            files={"file": ("image.jpg", b"\xff\xd8\xff\xe0", "image/jpeg")},
        )
        assert resp.status_code == 400
        assert "Unsupported" in resp.json()["detail"]

    def test_upload_empty_file(self):
        resp = client.post(
            "/api/upload",
            files={"file": ("empty.txt", b"", "text/plain")},
        )
        assert resp.status_code == 400
        assert "empty" in resp.json()["detail"].lower()


class TestSessionEndpoint:
    def test_delete_existing_session(self):
        # Upload first
        resp = client.post(
            "/api/upload",
            files={"file": ("test.txt", SAMPLE_TXT.encode(), "text/plain")},
        )
        session_id = resp.json()["session_id"]

        # Delete
        resp = client.delete(f"/api/session/{session_id}")
        assert resp.status_code == 200
        assert resp.json()["status"] == "deleted"

    def test_delete_nonexistent_session(self):
        resp = client.delete("/api/session/nonexistent-id")
        assert resp.status_code == 404

    def test_get_extraction(self):
        # Upload first
        resp = client.post(
            "/api/upload",
            files={"file": ("test.txt", SAMPLE_TXT.encode(), "text/plain")},
        )
        session_id = resp.json()["session_id"]

        # Get extraction
        resp = client.get(f"/api/session/{session_id}/extraction")
        assert resp.status_code == 200
        assert resp.json()["filename"] == "test.txt"
