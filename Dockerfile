# Stage 1: build Angular app
FROM node:20 AS build
WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо всі залежності, включно з devDependencies
RUN npm install

# Копіюємо весь проект
COPY . .

# Збираємо Angular SPA
RUN npx ng build --configuration=production --output-path=dist/browser

# Stage 2: serve app with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
