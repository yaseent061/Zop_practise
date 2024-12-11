FROM node:16-alpine

WORKDIR /app
COPY package.json yarn.lock .
COPY ./dist ./dist
COPY ./config ./config
RUN npm install

EXPOSE 3000

CMD ["npm","start"] 

HEALTHCHECK --interval=30s --timeout=20s --retries=3 \
  CMD curl --silent --fail http://localhost:5000/health || exit 1