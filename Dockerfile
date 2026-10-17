# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/Frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine
WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy server code
COPY server.js ./
COPY .env.example ./

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/Frontend/dist ./Frontend/dist

# Expose port and start
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
