FROM node:16-alpine AS build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Clear npm cache and install
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --no-optional

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]