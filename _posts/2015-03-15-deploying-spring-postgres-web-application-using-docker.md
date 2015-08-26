---
layout: post
title: Deploying Spring and Postgres Web Application using Docker
subtitle: Something about docker
---

After getting familiar with Docker, I wanted to play around and try to deploy sample Spring Boot application 
using PostgresSQL as database server.

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
to deploy microservices you can find 
[here](http://plainoldobjects.com/2014/11/16/deploying-spring-boot-based-microservices-with-docker/).

## Spring Boot and Docker

Now lets try to build a docker image and run a sample spring boot application using containers.

![Lets hack](http://tdelev.github.io/presentations/docker/images/hacking.gif)

Follows some hands on Docker hacking broken down in six steps.

### Step 1

Create a `Dockerfile` to create the Spring boot application Docker image.

```
FROM java:8
COPY demo-prod.jar /apps/spring_app/
WORKDIR /apps/spring_app
EXPOSE 8080
CMD ["java", "-jar", "demo-prod.jar"]
```

When building a Docker image, we usually start with some base image. The first
line `FROM java:8` sets official java:8 Docker image as a base.

## Step 2
