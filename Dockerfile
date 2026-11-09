# Stage 1: Build mã nguồn
FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Chạy thực tế Production (Gọn nhẹ & Khớp phiên bản 100%)
FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./

# SỬA TẠI ĐÂY: Lấy thẳng node_modules đã hòa giải từ builder sang, không chạy npm install lại nữa
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
