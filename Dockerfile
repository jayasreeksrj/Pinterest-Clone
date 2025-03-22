# Use official Node.js LTS image as base
FROM node:18-alpine 

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the entire project files into the container
COPY . .

# Expose port (Change if your app runs on a different port)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
