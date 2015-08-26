---
layout: post
title: Deploying Spring and Postgres Web Application using Docker
subtitle: > 
  Hands on introduction to Docker by deploying Spring Boot web application,
  using Postgres as database server and using volume containers to store data
---

After getting familiar with Docker, I wanted to play around and try to deploy 
sample [Spring Boot](http://projects.spring.io/spring-boot/) application using 
[PostgresSQL](http://www.postgresql.org/) as database server.

## What is Docker?

According the [official docs](http://jekyllrb.com/docs/posts/) Docker is a platform 
that can be used to **build**, **ship** and **run applications**. In the center of the Docker is the 
idea of **container**. Just as the physical ship containers are used to transport goods, the 
virtual container can be used to ship and deploy any service. 

One way of using containers to deploy apps or services is to package it as VM image. Some of
the downsides of VM approach are:

 - no guaranty of virtualized environment
 - heavyweight technology (not practical to deploy more than a couple of VMs on developer laptop)
 - slow and IO intensive building and starting process
 - deployment costs on IaaS such as AWS EC2 

Very nice introduction to Docker and detailed explanation how it can be used
to deploy microservices please read 
[here](http://plainoldobjects.com/2014/11/16/deploying-spring-boot-based-microservices-with-docker/).

## Spring Boot and Docker

Now lets try to build a docker image and run a sample Spring Boot application using containers.

![Lets hack](http://tdelev.github.io/presentations/docker/images/hacking.gif)

Follows some hands on Docker hacking broken down in six simple steps.

### Step 1

Create a `Dockerfile` to create the Spring boot application Docker image. We
will use this image to run containers with the application.

```
FROM java:8
COPY demo-prod.jar /apps/spring_app/
WORKDIR /apps/spring_app
EXPOSE 8080
CMD ["java", "-jar", "demo-prod.jar"]
```

The `Dockerfile` is a simple file that instructs Docker how to build the image.
Our file consists of the following instructions:

- `FROM` - specifies the starting (base) image from which we build our own image. In our
case this is the [official java:8 image](https://hub.docker.com/_/java/).
- `COPY` - copies the jar of the application in the image file system.
- `WORKDIR` - sets the current working directory where the container will run.
- `CMD` - instructs Docker what command to run when a container from this image is started.

### Step 2

In the second step we build the image running the command:

```
docker build -t tdelev/spring_app .
```

giving the image name `tdelev/spring_app`. Be careful with the `.` at the end, it is the context
directory where Docker builds the image and should only contain our packaged jar application.

### Step 3

Next we download already prepared image with Postgres database server. Just run the command and wait...

```
docker pull postgres
```

This will download the official postgres image from [hub.docker.com](https://hub.docker.com/).

### Step 4

In this step we will create something called 
**[data volume container](https://docs.docker.com/userguide/dockervolumes/)** 
that will be the storage for data from our database.

```
docker create -v /var/lib/postgresql/data --name spring_app_data postgres:9.4
```

We use the `postgres:9.4` image to create a new volume inside a container of 
this image at `/var/lib/postgresql/data`. We choose this location, because this is the default location
where postgres stores data from databases. By default this volume is mounted in read-write mode.

### Step 5

Now we are ready to start a container with database instance.
 
```
docker run --volumes-from spring_app_data \
 --name spring_app_pg \
 -e POSTGRES_USER=demouser -e POSTGRES_PASSWORD=demopass \
 -d -P postgres:9.4 \
```

This command will start a container named `spring_app_pg` in detached mode
and will set the environment variables `POSTGRES_USER` and `POSTGRES_PASSWORD`.
It will also mount all volumes from the container `spring_app_data` that we created
in the previous step.

Now we can connect to this database instance using the following command and execute some
queries or create databases.

```
docker run -it --link spring_app_pg:postgres \
--rm postgres sh -c 'exec psql -h "$POSTGRES_PORT_5432_TCP_ADDR" \
-p "$POSTGRES_PORT_5432_TCP_PORT" -U demouser' \

create database demo;
```

### Step 6

In the final step we are ready to run the application. To run, start a container with 
the following command:

```
docker run --name spring_app_container \
--link spring_app_pg:spring_app_pg \
-p 8080:8080 \
-d tdelev/spring_app
```

Here we start a container of the image we created in the Step 2 and use containers linking
to link with the database instance container, so our Spring Boot application can connect to the
database instance.

We can also connect to the database instance from our host using the port that was automatically 
exposed from the database instance container. To check the port execute `docker ps` and check the
 `PORTS` column. To connect to the database execute:
 
```
psql -h localhost -p 49157 -U demouser --password
```
 
where you substitute `49157` with your PORT number.

## Presentation

[Here](http://tdelev.github.io/presentations/docker/#/) you can view my presentation 
on a [JugMK technical session](http://jug.mk/event/tech-session/2015-03-25-javascript-docker.html).


