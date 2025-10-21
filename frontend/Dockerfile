FROM node:20-alpine AS build
WORKDIR /app
# Build-time config for Vite
ARG VITE_API_ORIGIN
ARG VITE_WS_ORIGIN
ENV VITE_API_ORIGIN=${VITE_API_ORIGIN}
ENV VITE_WS_ORIGIN=${VITE_WS_ORIGIN}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve with Vite preview (no Nginx as requested)
FROM node:20-alpine AS runtime
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist /app/dist
EXPOSE 80
CMD ["sh", "-c", "serve -s /app/dist -l 80"]


