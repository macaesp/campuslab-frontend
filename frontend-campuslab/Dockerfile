FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build -- --configuration production

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY package.json package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY --from=build /app/dist/frontend-campuslab ./dist/frontend-campuslab
EXPOSE 4000
CMD ["node", "dist/frontend-campuslab/server/server.mjs"]
