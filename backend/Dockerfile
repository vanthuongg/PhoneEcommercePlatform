# Use Node.js 20 Alpine image for security and small footprint
FROM node:20-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package configuration files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Copy backend source code
COPY . .

# Expose backend port
EXPOSE 5000

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Start backend server
CMD ["node", "server.js"]
