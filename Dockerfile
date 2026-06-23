# Use the official lightweight Node.js 22 image
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package configurations and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application files
COPY . .

# Expose the server port
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production

# Start the Express server
CMD ["npm", "start"]
