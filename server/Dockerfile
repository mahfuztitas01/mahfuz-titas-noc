# Mahfuz Titas NOC — backend + WhatsApp bot (always-on)
FROM node:20-slim

# one baileys dependency is fetched from git
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 4000 4001

# Cloud bridge (4000) + Baileys bot (4001)
CMD ["node", "start-all.js"]
