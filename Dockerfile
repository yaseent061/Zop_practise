FROM node:16-alpine AS build

WORKDIR /app

COPY package.json yarn.lock tsconfig.json .
COPY ./src ./src
COPY ./config ./config
RUN npm install
RUN npm run build

FROM node:16 AS runtime

WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/config /app/config
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/yarn.lock /app/yarn.lock

RUN npm install

EXPOSE 3000

CMD ["npm","start"] 

HEALTHCHECK --interval=30s --timeout=20s --retries=3 \
  CMD curl --silent --fail http://localhost:5000/health || exit 1