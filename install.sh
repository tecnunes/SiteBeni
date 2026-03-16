#!/bin/bash

#############################################
# BÉNI Restaurant - Script de Instalação
# Para Ubuntu 20.04/22.04/24.04
# Uso: git clone -> cd projeto -> sudo ./install.sh
#############################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}"
echo "=============================================="
echo "   BÉNI Restaurant - Instalação Automática   "
echo "=============================================="
echo -e "${NC}"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Por favor, execute como root: sudo ./install.sh${NC}"
    exit 1
fi

# Pegar o diretório atual (onde está o git clone)
INSTALL_DIR=$(pwd)

# Verificar se estamos no diretório correto
if [ ! -d "$INSTALL_DIR/backend" ] || [ ! -d "$INSTALL_DIR/frontend" ]; then
    echo -e "${RED}Erro: Execute este script na raiz do projeto (onde estão as pastas backend/ e frontend/)${NC}"
    exit 1
fi

echo -e "${BLUE}Diretório de instalação: $INSTALL_DIR${NC}"

# Detectar versão do Ubuntu
UBUNTU_VERSION=$(lsb_release -rs 2>/dev/null || echo "22.04")
UBUNTU_CODENAME=$(lsb_release -cs 2>/dev/null || echo "jammy")
echo -e "${BLUE}Ubuntu detectado: $UBUNTU_VERSION ($UBUNTU_CODENAME)${NC}"

#############################################
# 1. Atualizar sistema
#############################################
echo -e "\n${GREEN}[1/9] Atualizando sistema...${NC}"
apt-get update -y
apt-get upgrade -y

#############################################
# 2. Instalar dependências do sistema
#############################################
echo -e "\n${GREEN}[2/9] Instalando dependências do sistema...${NC}"
apt-get install -y curl wget git build-essential software-properties-common gnupg lsb-release unzip

#############################################
# 3. Instalar Node.js 20.x
#############################################
echo -e "\n${GREEN}[3/9] Instalando Node.js 20.x...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 18 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo -e "${BLUE}Node.js: $(node --version)${NC}"
echo -e "${BLUE}NPM: $(npm --version)${NC}"

# Instalar Yarn globalmente
echo -e "${YELLOW}Instalando Yarn...${NC}"
npm install -g yarn
echo -e "${BLUE}Yarn: $(yarn --version)${NC}"

#############################################
# 4. Instalar Python 3
#############################################
echo -e "\n${GREEN}[4/9] Instalando Python 3...${NC}"
apt-get install -y python3 python3-pip python3-venv python3-dev
echo -e "${BLUE}Python: $(python3 --version)${NC}"

#############################################
# 5. Instalar MongoDB
#############################################
echo -e "\n${GREEN}[5/9] Instalando MongoDB 7.0...${NC}"
if ! command -v mongod &> /dev/null; then
    # Importar chave GPG
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes
    
    # Adicionar repositório baseado na versão do Ubuntu
    if [[ "$UBUNTU_CODENAME" == "noble" ]]; then
        # Ubuntu 24.04
        echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
            tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    else
        # Ubuntu 20.04/22.04
        echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${UBUNTU_CODENAME}/mongodb-org/7.0 multiverse" | \
            tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    fi
    
    apt-get update -y
    apt-get install -y mongodb-org || {
        echo -e "${YELLOW}Tentando instalar MongoDB via snap...${NC}"
        apt-get install -y snapd
        snap install mongodb-org-server --channel=7.0/stable
    }
fi

# Iniciar MongoDB
systemctl start mongod || systemctl start snap.mongodb-org-server.mongod || true
systemctl enable mongod || systemctl enable snap.mongodb-org-server.mongod || true
echo -e "${GREEN}✓ MongoDB instalado e rodando${NC}"

#############################################
# 6. Configurar Backend
#############################################
echo -e "\n${GREEN}[6/9] Configurando Backend...${NC}"
cd "$INSTALL_DIR/backend"

# Criar ambiente virtual Python
python3 -m venv venv
source venv/bin/activate

# Atualizar pip
pip install --upgrade pip

# Instalar dependências Python
pip install -r requirements.txt

# Configurar arquivo .env do backend
JWT_SECRET=$(openssl rand -hex 32)
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=beni_restaurant
JWT_SECRET=$JWT_SECRET
EOF
echo -e "${GREEN}✓ Arquivo .env do backend criado${NC}"

# Criar diretório de uploads
mkdir -p uploads
chmod 755 uploads

deactivate

#############################################
# 7. Configurar Frontend
#############################################
echo -e "\n${GREEN}[7/9] Configurando Frontend...${NC}"
cd "$INSTALL_DIR/frontend"

# Detectar IP do servidor
SERVER_IP=$(hostname -I | awk '{print $1}')

# Perguntar se quer usar domínio
echo -e "${YELLOW}IP detectado: $SERVER_IP${NC}"
read -p "Deseja usar um domínio? (deixe vazio para usar IP): " DOMAIN

if [ -n "$DOMAIN" ]; then
    SITE_URL="http://$DOMAIN"
else
    SITE_URL="http://$SERVER_IP"
fi

# Configurar .env do frontend
cat > .env << EOF
REACT_APP_BACKEND_URL=$SITE_URL
EOF
echo -e "${GREEN}✓ Frontend configurado para: $SITE_URL${NC}"

# Instalar dependências
echo -e "${YELLOW}Instalando dependências do frontend (pode demorar alguns minutos)...${NC}"
yarn install

# Build de produção
echo -e "${YELLOW}Criando build de produção...${NC}"
yarn build

echo -e "${GREEN}✓ Build do frontend concluído${NC}"

#############################################
# 8. Configurar Nginx
#############################################
echo -e "\n${GREEN}[8/9] Configurando Nginx...${NC}"
apt-get install -y nginx

# Criar configuração do Nginx
cat > /etc/nginx/sites-available/beni << EOF
server {
    listen 80;
    server_name ${DOMAIN:-_};

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Frontend (React build estático)
    location / {
        root $INSTALL_DIR/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache para assets estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
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
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        client_max_body_size 50M;
    }
}
EOF

# Ativar site e remover default
ln -sf /etc/nginx/sites-available/beni /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx configurado${NC}"

#############################################
# 9. Criar serviço systemd
#############################################
echo -e "\n${GREEN}[9/9] Criando serviço do Backend...${NC}"
cat > /etc/systemd/system/beni-backend.service << EOF
[Unit]
Description=BÉNI Restaurant Backend API
After=network.target mongod.service
Wants=mongod.service

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=$INSTALL_DIR/backend
Environment="PATH=$INSTALL_DIR/backend/venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=$INSTALL_DIR/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Recarregar systemd
systemctl daemon-reload
systemctl start beni-backend
systemctl enable beni-backend

# Aguardar backend iniciar
sleep 3

# Verificar se está rodando
if systemctl is-active --quiet beni-backend; then
    echo -e "${GREEN}✓ Backend rodando com sucesso${NC}"
else
    echo -e "${RED}⚠ Backend pode não ter iniciado corretamente. Verifique: journalctl -u beni-backend -f${NC}"
fi

#############################################
# Finalização
#############################################
echo -e "\n${GREEN}"
echo "=============================================="
echo "   ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!      "
echo "=============================================="
echo -e "${NC}"

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📍 Acesso ao Site:${NC}"
echo -e "   Site:  ${GREEN}$SITE_URL${NC}"
echo -e "   Admin: ${GREEN}$SITE_URL/admin/login${NC}"
echo ""
echo -e "${YELLOW}🔐 Credenciais Admin:${NC}"
echo -e "   Usuário: ${GREEN}admin${NC}"
echo -e "   Senha:   ${GREEN}#Sti93qn06301616${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Comandos úteis:${NC}"
echo -e "   Ver logs:      ${GREEN}journalctl -u beni-backend -f${NC}"
echo -e "   Reiniciar:     ${GREEN}systemctl restart beni-backend${NC}"
echo -e "   Status:        ${GREEN}systemctl status beni-backend${NC}"
echo ""
echo -e "${BLUE}🔒 Para HTTPS (recomendado):${NC}"
echo -e "   ${GREEN}apt install certbot python3-certbot-nginx${NC}"
echo -e "   ${GREEN}certbot --nginx -d seu-dominio.com${NC}"
echo ""
echo -e "${GREEN}🍽️  Aproveite o BÉNI Restaurant!${NC}"
