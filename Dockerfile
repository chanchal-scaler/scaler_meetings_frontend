FROM node:22.13-alpine AS builder

WORKDIR /app

# Matches repo .npmrc: //registry.npmjs.org/:_authToken=${NPM_TOKEN}
# Set NPM_TOKEN in Railway and pass it as a Docker build arg so ENV is set during install.
ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}
ARG VITE_PUBLIC_BASE_PATH=/
ENV VITE_PUBLIC_BASE_PATH=${VITE_PUBLIC_BASE_PATH}
ARG VITE_MEETING_AGORA_APP_ID
ENV VITE_MEETING_AGORA_APP_ID=${VITE_MEETING_AGORA_APP_ID}
ARG VITE_MEETING_SETTINGS
ENV VITE_MEETING_SETTINGS=${VITE_MEETING_SETTINGS}
ARG VITE_MEETING_AGORA_RECORDING_CONFIG
ENV VITE_MEETING_AGORA_RECORDING_CONFIG=${VITE_MEETING_AGORA_RECORDING_CONFIG}
ARG VITE_MEETING_QUESTION_RATE_LIMIT_TIMEOUT
ENV VITE_MEETING_QUESTION_RATE_LIMIT_TIMEOUT=${VITE_MEETING_QUESTION_RATE_LIMIT_TIMEOUT}

COPY package.json yarn.lock .npmrc ./
RUN test -n "$NPM_TOKEN" || (echo "NPM_TOKEN build arg is required (same as local for private @vectord)" && exit 1)
RUN node -v && yarn -v && yarn install --frozen-lockfile --non-interactive --verbose

COPY . .
RUN echo "Building with VITE_PUBLIC_BASE_PATH=${VITE_PUBLIC_BASE_PATH}"
RUN echo "VITE_MEETING_AGORA_APP_ID is ${VITE_MEETING_AGORA_APP_ID:+set}"
RUN echo "VITE_MEETING_SETTINGS is ${VITE_MEETING_SETTINGS:+set}"
RUN yarn build

FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
