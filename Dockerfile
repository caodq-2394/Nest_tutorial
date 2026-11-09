# Stage 1: Build mã nguồn
FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Chạy thực tế Production
FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install --only=production --legacy-peer-deps

# Copy toàn bộ thư mục dist (bao gồm dist/src/main.js và các tệp i18n bên trong) từ builder sang
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

# SỬA TẠI ĐÂY: Trỏ chính xác vào file main.js nằm trong thư mục dist/src/
CMD ["node", "dist/src/main.js"]
