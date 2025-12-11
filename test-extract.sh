#!/bin/bash
# Test script for PDF extraction API
# Usage: ./test-extract.sh <pdf_url>

PDF_URL="${1:-https://www.amf-france.org/sites/default/files/2020-02/priips-kid-amundi-cac40.pdf}"

echo "🧪 Testing PDF extraction API..."
echo "📄 PDF URL: $PDF_URL"

curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d "{\"fileUrl\": \"$PDF_URL\", \"fileName\": \"test-document.pdf\"}" \
  | jq .

echo ""
echo "✅ Test complete"
