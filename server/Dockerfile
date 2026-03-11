FROM node:20-alpine
WORKDIR /app

# Install deps first (layer caching)
COPY package.json bun.lock* ./
RUN npm install --production

# Copy source
COPY . .

EXPOSE 4000

CMD ["node", "src/index.js"]
