#Use an official Node runtime as a parent image
FROM node:18


# Set the working directory in the container to /app
WORKDIR /app

#Copy package.json and package-lock.json into the working directory
COPY package*.json ./

#Install ffmpeg in the container
RUN apt-get update && apt-get install -y ffmpeg

#Install any needed packages specified in package.json
RUN npm install

#Copy the source code
COPY . .

#Make the port 3000 available outside this container
EXPOSE 3000

#Create command to run the program in the conatiner (This is the only CMD allowed)
CMD [ "npm", "start" ]