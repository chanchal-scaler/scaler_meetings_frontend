FROM node:20-alpine AS builder

WORKDIR /app

ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

COPY package.json yarn.lock .npmrc ./
RUN yarn install --frozen-lockfile --non-interactive

COPY . .
RUN yarn build

FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
