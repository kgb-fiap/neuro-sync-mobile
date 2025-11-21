# Multi-stage build for React Native Web (Expo)

# --- Estágio 1: Construir a aplicação ---
# Usando a versão Node 20 (LTS) baseada em Alpine para menor tamanho
FROM node:20-alpine AS build

# Atualizar pacotes apk para reduzir vulnerabilidades
RUN apk update && apk upgrade

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de pacotes
COPY package*.json ./

# Instalar dependências (Instalação limpa para reprodutibilidade)
RUN npm ci

# Copiar todos os arquivos fonte
COPY . .

# Construir a aplicação web para hospedagem estática
# Definindo explicitamente o diretório de saída para 'dist'
RUN npx expo export -p web --output-dir dist

# --- Estágio 2: Servidor Web (Nginx) ---
FROM nginx:alpine

# Copia os arquivos estáticos gerados no estágio anterior para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Healthcheck: verifica periodicamente se o Nginx serve conteúdo na raiz (GET /)
# Marca o container como "unhealthy" em caso de timeout ou erro de resposta
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]