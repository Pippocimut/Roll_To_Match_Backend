FROM alpine
RUN apk add --update nodejs npm
RUN npm install -g typescript
COPY . /
RUN npm install
RUN tsc --build
EXPOSE 3000
ENTRYPOINT ["sh", "-c", "node built/app.js"]