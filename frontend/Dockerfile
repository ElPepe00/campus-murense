FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# El flag --host es imprescindible para que Vite sea accesible fuera del contenedor Docker
CMD ["npm", "run", "dev", "--", "--host"]