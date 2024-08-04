FROM node:18
COPY . .
RUN npm install
EXPOSE 10000
CMD [ "node" ,"mirai.js" ]
