# Use official Node.js LTS image as base
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy remaining project files
COPY . .

# Expose the port (default: 3000, change if your app uses another)
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
