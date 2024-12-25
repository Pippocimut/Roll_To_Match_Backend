FROM alpine
RUN apk add --update nodejs npm
RUN npm install -g typescript
COPY . /
ENV MONGO_URL=mongodb+srv://NodeJSUser:ITfgdGZUTW1gJH6y@cluster0.lxafrex.mongodb.net/roll-to-match?retryWrites=true&w=majority&appName=Cluster0
ENV PORT=3000
ENV TOKEN_SECRET=secret
ENV CLIENT_ID=819188550192-m6gc9vme12jlg05nlpp6fb1klc4bufge.apps.googleusercontent.com
ENV CLIENT_SECRET=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
ENV SESSION_SECRET=secret
RUN npm install
EXPOSE 3000
ENTRYPOINT ["sh", "-c", "tsc --build && node built/app.js"]