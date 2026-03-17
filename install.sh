#!/bin/bash

#############################################
# BÉNI Restaurant - Script de Instalação
# Domínio: benirestaurant.com
# Para Ubuntu 20.04/22.04/24.04
#############################################

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
DOMAIN="benirestaurant.com"
INSTALL_DIR="/var/www/beni"

echo -e "${GREEN}"
echo "=============================================="
echo "   BÉNI Restaurant - Instalação              "
echo "   Domínio: $DOMAIN                          "
echo "=============================================="
echo -e "${NC}"

# Verificar root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Execute como root: sudo ./install.sh${NC}"
    exit 1
fi

# Pegar diretório atual (onde está o git clone)
SOURCE_DIR=$(pwd)

# Verificar se estamos no diretório correto
if [ ! -d "$SOURCE_DIR/backend" ] || [ ! -d "$SOURCE_DIR/frontend" ]; then
    echo -e "${RED}Erro: Execute na raiz do projeto (onde estão backend/ e frontend/)${NC}"
    exit 1
fi

echo -e "${BLUE}Origem: $SOURCE_DIR${NC}"
echo -e "${BLUE}Destino: $INSTALL_DIR${NC}"

#############################################
# 1. Atualizar sistema
#############################################
echo -e "\n${GREEN}[1/8] Atualizando sistema...${NC}"
apt-get update -y

#############################################
# 2. Instalar dependências
#############################################
echo -e "\n${GREEN}[2/8] Instalando dependências...${NC}"
apt-get install -y curl wget git build-essential gnupg unzip nginx

#############################################
# 3. Instalar Node.js 20.x
#############################################
echo -e "\n${GREEN}[3/8] Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
npm install -g yarn
echo -e "${BLUE}Node: $(node -v) | Yarn: $(yarn -v)${NC}"

#############################################
# 4. Instalar MongoDB
#############################################
echo -e "\n${GREEN}[4/8] Instalando MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes
    
    CODENAME=$(lsb_release -cs)
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    apt-get update -y
    apt-get install -y mongodb-org
fi
systemctl start mongod
systemctl enable mongod
echo -e "${GREEN}✓ MongoDB rodando${NC}"

#############################################
# 5. Copiar arquivos para /var/www/beni
#############################################
echo -e "\n${GREEN}[5/8] Copiando arquivos...${NC}"
mkdir -p $INSTALL_DIR
cp -r $SOURCE_DIR/backend $INSTALL_DIR/
cp -r $SOURCE_DIR/frontend $INSTALL_DIR/
echo -e "${GREEN}✓ Arquivos copiados para $INSTALL_DIR${NC}"

#############################################
# 6. Configurar Backend
#############################################
echo -e "\n${GREEN}[6/8] Configurando Backend...${NC}"
cd $INSTALL_DIR/backend

# Ambiente virtual
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# .env do backend
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=beni_restaurant
JWT_SECRET=$(openssl rand -hex 32)
EOF

mkdir -p uploads
chmod 755 uploads
deactivate
echo -e "${GREEN}✓ Backend configurado${NC}"

#############################################
# 7. Configurar Frontend
#############################################
echo -e "\n${GREEN}[7/8] Configurando Frontend...${NC}"
cd $INSTALL_DIR/frontend

# .env do frontend com domínio
cat > .env << EOF
REACT_APP_BACKEND_URL=https://$DOMAIN
EOF

yarn install
yarn build
echo -e "${GREEN}✓ Frontend compilado${NC}"

#############################################
# 8. Configurar Nginx + SSL
#############################################
echo -e "\n${GREEN}[8/8] Configurando Nginx...${NC}"

# Configuração inicial HTTP (para Certbot)
cat > /etc/nginx/sites-available/beni << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        root $INSTALL_DIR/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 50M;
    }
}
EOF

ln -sf /etc/nginx/sites-available/beni /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

#############################################
# Serviço systemd
#############################################
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

systemctl daemon-reload
systemctl start beni-backend
systemctl enable beni-backend

#############################################
# Instalar Certbot para HTTPS
#############################################
echo -e "\n${YELLOW}Instalando Certbot para HTTPS...${NC}"
apt-get install -y certbot python3-certbot-nginx

echo -e "\n${GREEN}"
echo "=============================================="
echo "   ✅ INSTALAÇÃO CONCLUÍDA!                  "
echo "=============================================="
echo -e "${NC}"

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📍 Diretório instalado: ${GREEN}$INSTALL_DIR${NC}"
echo ""
echo -e "${YELLOW}🌐 Próximo passo - Ativar HTTPS:${NC}"
echo -e "   ${GREEN}sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}📍 Após HTTPS, acesse:${NC}"
echo -e "   Site:  ${GREEN}https://$DOMAIN${NC}"
echo -e "   Admin: ${GREEN}https://$DOMAIN/admin/login${NC}"
echo ""
echo -e "${YELLOW}🔐 Credenciais:${NC}"
echo -e "   Usuário: ${GREEN}admin${NC}"
echo -e "   Senha:   ${GREEN}#Sti93qn06301616${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Comandos úteis:${NC}"
echo -e "   Logs:      journalctl -u beni-backend -f"
echo -e "   Reiniciar: systemctl restart beni-backend"
echo -e "   Status:    systemctl status beni-backend"
echo ""
echo -e "${GREEN}🍽️  BÉNI Restaurant pronto!${NC}"
