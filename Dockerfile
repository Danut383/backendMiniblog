# Usa una imagen base oficial de Node.js
FROM node:18-alpine

# Crea directorio de trabajo
WORKDIR /app

# Copia archivos de configuración y dependencias
COPY package*.json ./

# Instala dependencias de producción
RUN npm ci --only=production

# Copia el resto del código
COPY . .

# Genera el cliente Prisma
RUN npx prisma generate

# Crea un usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambia ownership de archivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expone el puerto
EXPOSE 4000

# Comando para correr tu app
CMD ["npm", "start"]
