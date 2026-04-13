FROM node:22-alpine AS build

WORKDIR /booking-ticket/client

COPY package*.json ./

RUN npm ci
COPY . /booking-ticket/client

RUN npm run build

ENV CI=true
ENV PORT=3003

FROM nginx:alpine

COPY --from=build /booking-ticket/client/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /booking-ticket/client/dist .

EXPOSE 3003

ENTRYPOINT ["nginx", "-g", "daemon off;"]