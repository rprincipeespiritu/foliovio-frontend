FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_PRICE="S/ 19"
ARG VITE_CHECKOUT_URL=""
ARG VITE_WHATSAPP=""
ARG VITE_CONTACT_EMAIL=""
# Railway uses the same-origin /api proxy configured in Caddy.
ENV VITE_API_URL=""
RUN npm run build

FROM caddy:2-alpine AS runtime
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
