FROM node:22-alpine AS build

WORKDIR /eng-center/client

COPY package*.json ./

RUN npm ci
COPY . /eng-center/client

RUN npm run build

ENV CI=true
ENV PORT=3003

FROM nginx:alpine

COPY --from=build /eng-center/client/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /eng-center/client/dist .

EXPOSE 3003

ENTRYPOINT ["nginx", "-g", "daemon off;"]