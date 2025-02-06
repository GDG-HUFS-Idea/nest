FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD npm run drizzle:push \
    && npm run start:dev