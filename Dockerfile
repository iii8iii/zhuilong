FROM mcr.microsoft.com/playwright

#TZ
RUN apt-get update -y
RUN apt-get install -y tzdata
ENV TZ 	Asia/Shanghai

ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci
# If you are building your code for production
# RUN npm ci

# Bundle app source
COPY . .

CMD [ "npm", "start" ]