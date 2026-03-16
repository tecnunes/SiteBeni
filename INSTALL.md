# BÉNI Restaurant - Guia de Instalação

## Requisitos Mínimos
- Ubuntu 20.04, 22.04 ou 24.04 (64-bit)
- 2GB RAM (mínimo)
- 10GB espaço em disco
- Acesso root/sudo

## Instalação Rápida

### 1. Transferir os arquivos para o servidor

```bash
# No seu computador local, envie o arquivo zip para o servidor:
scp beni-restaurant.zip usuario@seu-servidor:/home/usuario/
```

### 2. No servidor, extrair e instalar

```bash
# Conectar ao servidor
ssh usuario@seu-servidor

# Criar diretório e extrair
mkdir -p /var/www/beni
cd /var/www/beni
unzip /home/usuario/beni-restaurant.zip -d .

# Dar permissão ao script
chmod +x install.sh

# Executar instalação (como root)
sudo ./install.sh
```

### 3. Após instalação

O site estará disponível em:
- **Site público**: `http://SEU-IP/`
- **Admin**: `http://SEU-IP/admin/login`
- **Credenciais**: `admin` / `#Sti93qn06301616`

## Instalação Manual (Alternativa)

Se preferir instalar manualmente:

### 1. Instalar dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn

# Instalar Python
sudo apt install -y python3 python3-pip python3-venv

# Instalar MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
    sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Configurar Backend

```bash
cd /var/www/beni/backend

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Criar arquivo .env
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=beni_restaurant
JWT_SECRET=$(openssl rand -hex 32)
EOF

# Iniciar backend (para teste)
uvicorn server:app --host 0.0.0.0 --port 8001
```

### 3. Configurar Frontend

```bash
cd /var/www/beni/frontend

# Configurar URL do backend
echo "REACT_APP_BACKEND_URL=http://SEU-IP:8001" > .env

# Instalar dependências e fazer build
yarn install
yarn build
```

### 4. Configurar Nginx

```bash
sudo apt install -y nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/beni
```

Conteúdo do arquivo:
```nginx
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/beni/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 50M;
    }
}
```

```bash
# Ativar site
sudo ln -sf /etc/nginx/sites-available/beni /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Configurar HTTPS (Opcional mas Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL (substitua pelo seu domínio)
sudo certbot --nginx -d seu-dominio.com

# Atualizar .env do frontend com HTTPS
echo "REACT_APP_BACKEND_URL=https://seu-dominio.com" > /var/www/beni/frontend/.env
cd /var/www/beni/frontend && yarn build
sudo systemctl restart nginx
```

## Comandos Úteis

```bash
# Ver logs do backend
sudo journalctl -u beni-backend -f

# Reiniciar serviços
sudo systemctl restart beni-backend
sudo systemctl restart nginx
sudo systemctl restart mongod

# Ver status
sudo systemctl status beni-backend
sudo systemctl status nginx
sudo systemctl status mongod

# Backup do banco de dados
mongodump --db beni_restaurant --out /backup/$(date +%Y%m%d)

# Restaurar banco de dados
mongorestore --db beni_restaurant /backup/YYYYMMDD/beni_restaurant
```

## Solução de Problemas

### Backend não inicia
```bash
# Verificar logs
sudo journalctl -u beni-backend -n 50

# Verificar se MongoDB está rodando
sudo systemctl status mongod

# Testar manualmente
cd /var/www/beni/backend
source venv/bin/activate
python -c "from server import app; print('OK')"
```

### Frontend não carrega
```bash
# Verificar se o build existe
ls -la /var/www/beni/frontend/build

# Refazer build
cd /var/www/beni/frontend
yarn build

# Verificar permissões
sudo chown -R www-data:www-data /var/www/beni/frontend/build
```

### Erro de conexão com MongoDB
```bash
# Verificar status
sudo systemctl status mongod

# Verificar logs
sudo tail -f /var/log/mongodb/mongod.log

# Reiniciar MongoDB
sudo systemctl restart mongod
```

## Contato

Desenvolvido para BÉNI Restaurant
Admin: admin / #Sti93qn06301616
