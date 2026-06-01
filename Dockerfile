FROM node:22-alpine
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/src/ ./src/
EXPOSE 3000
CMD ["node", "src/index.js"]
