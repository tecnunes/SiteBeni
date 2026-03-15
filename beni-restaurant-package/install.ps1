# ===========================================
# BÉNI Restaurant - Script de Instalação (Windows)
# ===========================================

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  BENI Restaurant - Instalacao" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python instalado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python nao encontrado. Por favor, instale Python 3.9+" -ForegroundColor Red
    exit 1
}

# Verificar Node
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js nao encontrado. Por favor, instale Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Instalando dependencias do Backend..." -ForegroundColor Yellow
Set-Location backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
deactivate
Set-Location ..

Write-Host ""
Write-Host "Instalando dependencias do Frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install --legacy-peer-deps
Set-Location ..

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  Instalacao Concluida!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor White
Write-Host ""
Write-Host "1. Configure as variaveis de ambiente:" -ForegroundColor White
Write-Host "   - backend\.env (MONGO_URL, DB_NAME, JWT_SECRET)" -ForegroundColor Gray
Write-Host "   - frontend\.env (REACT_APP_BACKEND_URL)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Inicie o Backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   uvicorn server:app --host 0.0.0.0 --port 8001 --reload" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Inicie o Frontend (em outro terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Acesse:" -ForegroundColor White
Write-Host "   - Site: http://localhost:3000" -ForegroundColor Gray
Write-Host "   - Admin: http://localhost:3000/admin/login" -ForegroundColor Gray
Write-Host ""
Write-Host "   Credenciais Admin:" -ForegroundColor Yellow
Write-Host "   - Identifiant: admin" -ForegroundColor White
Write-Host "   - Mot de passe: #Sti93qn06301616" -ForegroundColor White
Write-Host ""
