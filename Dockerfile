FROM node:22.13-alpine AS builder

WORKDIR /app

# Matches repo .npmrc: //registry.npmjs.org/:_authToken=${NPM_TOKEN}
# Set NPM_TOKEN in Railway and pass it as a Docker build arg so ENV is set during install.
ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

COPY package.json yarn.lock .npmrc ./
RUN test -n "$NPM_TOKEN" || (echo "NPM_TOKEN build arg is required (same as local for private @vectord)" && exit 1)
RUN node -v && yarn -v && yarn install --frozen-lockfile --non-interactive --verbose

COPY . .
RUN yarn build

FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
