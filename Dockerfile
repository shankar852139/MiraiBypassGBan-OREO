FROM node:18
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "node" ,"mirai.js" ]
