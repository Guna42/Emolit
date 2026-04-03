# 🏗️ Build stage
FROM node:18-alpine as build-stage
WORKDIR /app
# 🔑 THE MAGIC LINE: Tell Node.js it can use 2GB of memory!
ENV NODE_OPTIONS="--max-old-space-size=2048"
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 🌐 Production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/build /usr/share/nginx/html
# 🔧 Add Nginx config later for proper React routing
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
