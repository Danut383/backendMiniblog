# Usa una imagen base oficial de Node.js
FROM node:18

# Crea directorio de trabajo
WORKDIR /app

# Copia archivos de configuración y dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto (Render usará su propio valor de $PORT)
EXPOSE 4000

# Comando para correr tu app
CMD ["npm", "start"]
