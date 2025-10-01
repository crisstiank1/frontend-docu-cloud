# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

# Directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Compilamos el proyecto (genera /dist)
RUN npm run build


# ---- Stage 2: Serve with Nginx ----
FROM nginx:stable-alpine

# Limpiamos configuración default
RUN rm -rf /usr/share/nginx/html/*

# Copiamos la build de Vue
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiamos configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

# Iniciamos Nginx
CMD ["nginx", "-g", "daemon off;"]
