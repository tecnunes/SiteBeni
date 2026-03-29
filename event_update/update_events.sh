#!/bin/bash

#############################################
# Script de Atualização - Funcionalidade de Eventos
# Execute no servidor após a instalação inicial
#############################################

echo "🔄 Atualizando funcionalidade de Eventos..."

# Diretório de instalação
INSTALL_DIR="/var/www/beni"

# Verificar se o diretório existe
if [ ! -d "$INSTALL_DIR" ]; then
    echo "❌ Diretório $INSTALL_DIR não encontrado. Instale o sistema primeiro."
    exit 1
fi

# Backup dos arquivos atuais
echo "📦 Criando backup..."
mkdir -p $INSTALL_DIR/backup_$(date +%Y%m%d)
cp $INSTALL_DIR/backend/server.py $INSTALL_DIR/backup_$(date +%Y%m%d)/
cp $INSTALL_DIR/frontend/src/pages/EventPage.js $INSTALL_DIR/backup_$(date +%Y%m%d)/ 2>/dev/null || true
cp $INSTALL_DIR/frontend/src/pages/admin/AdminDashboard.js $INSTALL_DIR/backup_$(date +%Y%m%d)/
cp $INSTALL_DIR/frontend/src/App.js $INSTALL_DIR/backup_$(date +%Y%m%d)/

# Copiar novos arquivos
echo "📝 Copiando arquivos atualizados..."
cp server.py $INSTALL_DIR/backend/
cp EventPage.js $INSTALL_DIR/frontend/src/pages/
cp AdminDashboard.js $INSTALL_DIR/frontend/src/pages/admin/
cp App.js $INSTALL_DIR/frontend/src/

# Instalar jsPDF se necessário
echo "📦 Instalando dependências..."
cd $INSTALL_DIR/frontend
yarn add jspdf

# Rebuild do frontend
echo "🔨 Reconstruindo frontend..."
yarn build

# Reiniciar backend
echo "🔄 Reiniciando backend..."
sudo systemctl restart beni-backend

echo ""
echo "=============================================="
echo "✅ ATUALIZAÇÃO CONCLUÍDA!"
echo "=============================================="
echo ""
echo "Novas funcionalidades:"
echo "  - Senha obrigatória para organizadores"
echo "  - Convidados não podem ver/editar pedidos após enviar"
echo "  - PDF da cozinha separado (somente restaurante)"
echo "  - PDF completo para organizador"
echo ""
