---
layout: main
title: Deploying Spring and Postgres Web Application using Docker
---

# Deploying Spring and Postgres Web Application using Docker

After getting familiar with Docker, I wanted to use to deploy my Spring Boot application along with
the PostgresSQL database server.

## What is Docker?

According the [official docs](http://jekyllrb.com/docs/posts/) Docker is a platform 
that can be used to build, ship and run applications. In the center of the Docker is the 
idea of container. Just as the phisical ship containers are used to tranport goods, the 
virtual container can be used to ship and deploy any service. 

One way of using containers to deploy apps or services is to package it as VM image. Some of
the downsides of VM aproach are:

 - no guaranty of virtualized envirnoment
 - heavyweight technology (not practical to deploy more than a couple of VMs on developer laptop)
 - slow and IO intensive building and starting process
 - deployment costs on IaaS such as AWS EC2 

## Docker introduction

[Docker](https://www.docker.com/) is a new way to containerize applications that is becomingly increasingly popular. It allows you to package a microservice in a standardized portable format that’s independent of the technology used to implement the service. At runtime it provides a high degree of isolat ion between different services. However, unlike virtual machines, Docker containers are extremely lightweight and as a result can be built and started extremely quickly. A container can typically be built in just a few seconds and starting a container simply consists of starting the service’s process(es).

Docker runs on a variety of platforms. It runs natively on Linux. You can also run Docker on Windows and Mac OSX using Boot2Docker, which runs the Docker daemon in a VirtualBox VM. Some clouds also have added extra support for Docker. For example, not only can you run Docker inside your EC2 instances but you can also use Elastic Beanstalk to run Docker containers. Amazon also recently announced the Amazon EC2 Container Service, which is a hosted Docker container management service.  Google Cloud also has support for Docker.

The two main Docker concepts are image, which is a portable application packaging format, and container, which is a running image and consists of one or more sandboxed processes. Let’s first look at how images work.

## Docker images

A Docker image is read-only file system image of an operating system and an application. It’s analogous to an AWS EC2 AMI. An image is self-contained and will run on any Docker installation. You can create an image from scratch but normally an image is created by starting a container from existing base image, installing applications by executing the same kinds of commands you would use when configuring a regular machine, such as apt-get install –y and then saving the container as a new image. For example, to create an image containing a Spring Boot based application, you could start from a vanilla Ubuntu image, install the JDK and then install the executable JAR.

In many ways, building a Docker image is similar to building an AMI. However, while an AMI is a blob of bits, a Docker image has a layered structure that dramatically reduces the amount of time needed to build and deploy a Docker image. An image consists of a sequence of layers. When building an image, each command that changes the file system (e.g. apt-get install) create a new layer that references it’s parent layer.

This layered structure has two important benefits. First it enables of sharing of layers between images, which means that Docker does not need to move an entire image over the network. Only those layers that don’t exist on the destination machine need to be copied, which usually results in a dramatic speedup. Another important benefit of the layered structure is that Docker aggressively caches layers when building an image. When re-executing a command against an input layer Docker tries to skip executing the command and instead reuses the already built output layer. As a result, building an image is usually extremely fast.

## Docker containers

A Docker container is a running image consisting of one or more sandboxed processes. Docker isolates a container’s processes using a variety of mechanisms including relatively mature OS-level virtualization mechanisms such as control groups and namespaces. Each process group has its own root file-system. Process groups can be assigned resource limits, e.g. CPU and memory limits. In the same way that a hypervisor divides up the hardware amongst virtual machines, this mechanism divides up the OS between process groups. Each Docker container is a process group.

Docker also isolates the networking portion of each container. When Docker is installed, it creates a virtual interface called docker0 on the host and sets up subnet. Each container is given it’s own virtual interface called eth0 (within the container’s namespace), which is assigned an available IP address from the Docker subnet. This means, for example, that a Spring Boot application running in a container listens on port 8080 of the virtual interface that’s specific to its container. Later on we will look how you can enable a service to be accessed from outside its container by setting up a port mapping that associates a host port with a container port.

It’s important to remember that even though an image contains an entire OS a Docker container often only consists of the application’s processes. You often don’t need to start any of the typical OS processes such as initd. For example, a Docker container that runs a Spring Boot application might only start Java. As a result, a Docker container has a minimal runtime overhead and its startup time is the startup time of your application.

Now that we have looked at basic Docker concepts let’s look at using Docker to package Spring Boot applications.

## Spring Boot and Docker

Let’s now build a Docker image that runs the Spring Boot application. Because Spring Boot packages the application as a self-contained executable JAR, we just need to build an image containing that JAR file and Java. One option is to take a vanilla Ubuntu Docker image, install Java and install the JAR. Fortunately, we can skip the first step because it’s already been done. One of the great features of the Docker ecosystem is https://hub.docker.com, which is a website where the community shares Docker images. There are a huge number of images available including dockerfile/java, which provides Java images for Oracle and OpenJDK versions 6, 7, and 8.

Once we have identified a suitable base image the next step is to build a new image that runs the Spring Boot application. You could build an image manually by launching the base image and entering shell commands in pretty much the same way that you would configure a regular OS. However, it’s much better to automate image creation. To do that we need to create a Dockerfile, which is a text file containing series of commands that tell Docker how to build an image. Once we have written a Dockerfile, we can then repeatedly build an image by running docker build.

Here is the Dockerfile (see github repo) that builds an image that runs the application

## Step 1

## Step 2
