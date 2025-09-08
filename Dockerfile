FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev # ✅ works without package-lock.json
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
