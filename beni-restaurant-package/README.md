# BÉNI Restaurant Website

Site elegante para restaurante com painel de administração completo.

## Requisitos

- Python 3.9+
- Node.js 18+
- MongoDB 5.0+

## Instalação Rápida

### Linux/Mac
```bash
chmod +x install.sh
./install.sh
```

### Windows (PowerShell)
```powershell
.\install.ps1
```

## Configuração Manual

### 1. Backend

```bash
cd backend

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\Activate.ps1  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install --legacy-peer-deps

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## Executando

### Backend
```bash
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
npm start
```

## Acesso

- **Site**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/login

### Credenciais Admin Padrão
- **Identifiant**: `admin`
- **Mot de passe**: `#Sti93qn06301616`

## Estrutura do Projeto

```
beni-restaurant/
├── backend/
│   ├── server.py          # API FastAPI
│   ├── requirements.txt   # Dependências Python
│   ├── .env.example       # Exemplo de configuração
│   └── uploads/           # Pasta para uploads de imagens
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── contexts/      # Contextos (Auth, Language)
│   │   └── App.js         # App principal
│   ├── package.json       # Dependências Node
│   └── .env.example       # Exemplo de configuração
├── install.sh             # Script instalação Linux/Mac
├── install.ps1            # Script instalação Windows
└── README.md              # Este arquivo
```

## Funcionalidades

### Site Público
- **Home**: Hero, Sobre, Preview do Menu, CTA de Reservas
- **Nossa História**: História do restaurante e do chef
- **Cardápio**: Menu completo com preços
- **Menu da Semana**: Pratos da semana com fórmulas
- **Galeria**: Fotos do restaurante e pratos
- **Reservas**: Sistema de reservas com calendário

### Painel Admin
- **Menu Semaine**: Gestão do menu semanal
- **Cardápio Completo**: CRUD de todos os itens do menu
- **Textes du Site**: Edição de todos os textos (3 idiomas)
- **Images du Site**: Upload e gestão de imagens
- **Paramètres**: Configurações gerais do restaurante
- **Réservations**: Gestão de reservas
- **Utilisateurs**: Gestão de administradores

### Multi-idioma
- Français (padrão)
- English
- Português

## Deploy em Produção

### Com Docker (recomendado)

```bash
docker-compose up -d
```

### Manual (Ubuntu/Debian)

1. Instale Nginx, MongoDB
2. Configure o backend com Gunicorn
3. Build do frontend: `npm run build`
4. Configure Nginx para servir o frontend e proxy para o backend

## Suporte

Para dúvidas ou problemas, entre em contato.

---

Desenvolvido com ❤️
