# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia el package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias dentro del contenedor
RUN npm install

# Variables de entorno
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=123456
ENV POSTGRES_DB=compras_db
ENV POSTGRES_HOST=compras-db
ENV POSTGRES_PORT=5432

# Copia todo el código de la aplicación al contenedor
COPY . .

# Expone el puerto 3000
EXPOSE 3000

# Comando para ejecutar el servidor
CMD ["node", "server.js"]
