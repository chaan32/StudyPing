# 1단계: 빌드
FROM node:20-alpine as build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# 2단계: Nginx로 서비스
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]