#!/bin/bash

#############################################
# BÉNI Restaurant - Script de Instalação
# Para Ubuntu 20.04/22.04/24.04
#############################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "=============================================="
echo "   BÉNI Restaurant - Instalação Automática   "
echo "=============================================="
echo -e "${NC}"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Por favor, execute como root (sudo)${NC}"
    exit 1
fi

# Pegar o diretório atual
INSTALL_DIR=$(pwd)
echo -e "${YELLOW}Diretório de instalação: $INSTALL_DIR${NC}"

#############################################
# 1. Atualizar sistema
#############################################
echo -e "\n${GREEN}[1/8] Atualizando sistema...${NC}"
apt-get update -y
apt-get upgrade -y

#############################################
# 2. Instalar dependências do sistema
#############################################
echo -e "\n${GREEN}[2/8] Instalando dependências do sistema...${NC}"
apt-get install -y curl wget git build-essential software-properties-common

#############################################
# 3. Instalar Node.js 20.x
#############################################
echo -e "\n${GREEN}[3/8] Instalando Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
node --version
npm --version

# Instalar Yarn
echo -e "${YELLOW}Instalando Yarn...${NC}"
npm install -g yarn

#############################################
# 4. Instalar Python 3.11+
#############################################
echo -e "\n${GREEN}[4/8] Instalando Python 3.11...${NC}"
apt-get install -y python3 python3-pip python3-venv
python3 --version

#############################################
# 5. Instalar MongoDB
#############################################
echo -e "\n${GREEN}[5/8] Instalando MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    # Importar chave pública do MongoDB
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Adicionar repositório (Ubuntu 22.04)
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    apt-get update -y
    apt-get install -y mongodb-org
fi

# Iniciar MongoDB
systemctl start mongod
systemctl enable mongod
echo -e "${GREEN}MongoDB instalado e rodando!${NC}"

#############################################
# 6. Configurar Backend
#############################################
echo -e "\n${GREEN}[6/8] Configurando Backend...${NC}"
cd "$INSTALL_DIR/backend"

# Criar ambiente virtual Python
python3 -m venv venv
source venv/bin/activate

# Instalar dependências Python
pip install --upgrade pip
pip install -r requirements.txt

# Configurar arquivo .env do backend
if [ ! -f .env ]; then
    cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=beni_restaurant
JWT_SECRET=$(openssl rand -hex 32)
EOF
    echo -e "${YELLOW}Arquivo .env do backend criado!${NC}"
fi

# Criar diretório de uploads
mkdir -p uploads
chmod 755 uploads

deactivate

#############################################
# 7. Configurar Frontend
#############################################
echo -e "\n${GREEN}[7/8] Configurando Frontend...${NC}"
cd "$INSTALL_DIR/frontend"

# Configurar arquivo .env do frontend
# Substitua YOUR_SERVER_IP pelo IP ou domínio do seu servidor
SERVER_IP=$(hostname -I | awk '{print $1}')
cat > .env << EOF
REACT_APP_BACKEND_URL=http://$SERVER_IP:8001
EOF
echo -e "${YELLOW}Arquivo .env do frontend criado com IP: $SERVER_IP${NC}"

# Instalar dependências do frontend
yarn install

# Build do frontend para produção
echo -e "${YELLOW}Criando build de produção...${NC}"
yarn build

#############################################
# 8. Configurar Nginx (opcional mas recomendado)
#############################################
echo -e "\n${GREEN}[8/8] Instalando e configurando Nginx...${NC}"
apt-get install -y nginx

# Criar configuração do Nginx
cat > /etc/nginx/sites-available/beni << EOF
server {
    listen 80;
    server_name _;

    # Frontend (React build)
    location / {
        root $INSTALL_DIR/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 50M;
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/beni /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

#############################################
# 9. Criar serviço systemd para o Backend
#############################################
echo -e "\n${GREEN}Criando serviço do Backend...${NC}"
cat > /etc/systemd/system/beni-backend.service << EOF
[Unit]
Description=BÉNI Restaurant Backend
After=network.target mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/backend
Environment="PATH=$INSTALL_DIR/backend/venv/bin"
ExecStart=$INSTALL_DIR/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Recarregar systemd e iniciar serviço
systemctl daemon-reload
systemctl start beni-backend
systemctl enable beni-backend

#############################################
# Finalização
#############################################
echo -e "\n${GREEN}"
echo "=============================================="
echo "   INSTALAÇÃO CONCLUÍDA COM SUCESSO!         "
echo "=============================================="
echo -e "${NC}"

echo -e "${YELLOW}Informações de acesso:${NC}"
echo -e "  - Site: http://$SERVER_IP"
echo -e "  - Admin: http://$SERVER_IP/admin/login"
echo -e "  - Usuário admin: admin"
echo -e "  - Senha admin: #Sti93qn06301616"
echo ""
echo -e "${YELLOW}Comandos úteis:${NC}"
echo -e "  - Ver logs do backend: journalctl -u beni-backend -f"
echo -e "  - Reiniciar backend: systemctl restart beni-backend"
echo -e "  - Ver status: systemctl status beni-backend"
echo -e "  - Reiniciar Nginx: systemctl restart nginx"
echo ""
echo -e "${GREEN}Aproveite o BÉNI Restaurant! 🍽️${NC}"
