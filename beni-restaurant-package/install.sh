#!/bin/bash

# ===========================================
# BÉNI Restaurant - Script de Instalação
# ===========================================

set -e

echo "============================================="
echo "  BÉNI Restaurant - Instalação"
echo "============================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Aviso: Recomendado rodar como root para instalar dependências do sistema${NC}"
fi

# Verificar requisitos
echo -e "${YELLOW}Verificando requisitos...${NC}"

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 não encontrado. Por favor, instale $1${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 instalado${NC}"
        return 0
    fi
}

check_command python3 || exit 1
check_command pip3 || check_command pip || exit 1
check_command node || exit 1
check_command npm || exit 1
check_command mongod || echo -e "${YELLOW}⚠ MongoDB não encontrado localmente. Certifique-se de ter uma conexão MongoDB disponível.${NC}"

echo ""
echo -e "${YELLOW}Instalando dependências do Backend...${NC}"
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

echo ""
echo -e "${YELLOW}Instalando dependências do Frontend...${NC}"
cd frontend
npm install --legacy-peer-deps
cd ..

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}  Instalação Concluída!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Configure as variáveis de ambiente:"
echo "   - backend/.env (MONGO_URL, DB_NAME, JWT_SECRET)"
echo "   - frontend/.env (REACT_APP_BACKEND_URL)"
echo ""
echo "2. Inicie o Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
echo ""
echo "3. Inicie o Frontend (em outro terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "4. Acesse:"
echo "   - Site: http://localhost:3000"
echo "   - Admin: http://localhost:3000/admin/login"
echo ""
echo "   Credenciais Admin:"
echo "   - Identifiant: admin"
echo "   - Mot de passe: #Sti93qn06301616"
echo ""
