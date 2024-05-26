# DEV ENVIRONMENT
FROM node:22.1 as dev

RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./api .

# PROD ENVIRONMENT
FROM node:22.1-bullseye-slim as build

WORKDIR /app

COPY ./api .

RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:22.1-bullseye-slim as prod

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

WORKDIR /app

RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

COPY --from=build /app/dist/src /app/dist
COPY --from=build /app/node_modules /app/node_modules

CMD ["node", "/app/dist/main.js"]

# UI GRAFANA ENVIRONMENT
FROM grafana/grafana:10.4.2 as ui

COPY ./grafana/provisioning /etc/grafana/provisioning
COPY ./grafana/dashboards/cities.json /var/lib/grafana/dashboards/cities.json

ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_DISABLE_LOGIN_FORM=true
ENV GF_AUTH_ORG_ROLE=Admin
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Admin

RUN grafana cli plugins install yesoreyeram-infinity-datasource && \
  grafana cli --pluginUrl https://github.com/VolkovLabs/volkovlabs-env-datasource/releases/download/v3.1.0/volkovlabs-env-datasource-3.1.0.zip plugins install volkovlabs-env-datasource

# Remember to override the API_URL based on your needs
ENV API_URL=http://app:5000

EXPOSE 3000
ENTRYPOINT ["/run.sh"]

## React UI

FROM node:22.1 as uidependencies

WORKDIR /app

COPY ./ui/package*.json ./
COPY ./ui/yarn.lock yarn.lock

RUN yarn install --frozen-lockfile

FROM nginx:latest
COPY --from=uidependencies /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]