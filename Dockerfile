FROM node:22-alpine

WORKDIR /usr/src/app

# Copy các file quản lý thư viện vào trước để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt toàn bộ thư viện (bao gồm cả driver pg cho postgres)
RUN npm install --legacy-peer-deps

# Copy toàn bộ mã nguồn còn lại vào container
COPY . .

# Tiến hành biên dịch mã nguồn NestJS ra thư mục dist
RUN npm run build

# Khai báo cổng lắng nghe
EXPOSE 3000

# Khởi chạy ứng dụng trực tiếp bằng npm script để package.json tự động đồng bộ biến môi trường hệ thống
CMD ["npm", "run", "start:prod"]
