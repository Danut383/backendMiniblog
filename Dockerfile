FROM node:20.11.1-slim
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get upgrade -y && npm install --production && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY . .
CMD ["node", "index.js"]
