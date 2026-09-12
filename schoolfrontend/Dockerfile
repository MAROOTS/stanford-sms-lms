FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_ROOT_DOMAIN
ENV VITE_ROOT_DOMAIN=$VITE_ROOT_DOMAIN
RUN npm run build

FROM alpine:3.20
COPY --from=build /app/dist /dist