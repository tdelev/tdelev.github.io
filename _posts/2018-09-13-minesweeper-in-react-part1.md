---
layout: post
title: Minesweeper in TypeScript and React (Part 1)
subtitle: > 
  Implementing Minesweeper clone in TypeScript and React
---

One of the games that I occasionally play to relax is Minesweeper.
Since I wanted to learn React and I'm already familiar with other JavaScript front-end technologies such as Angular, implementing this game was an interesting challenge. 

In this series I will try to explain how I did it and maybe learn you how to implement your clone of this or maybe some other game. 


## Before we start

You will need to install on your machine:
 
* [NodeJS](https://nodejs.org) and [npm](https://nodejs.org)
* [Create React App](https://github.com/facebook/create-react-app)

## Structuring the React app

One of the important steps in implementing any React application is how to brake down the UI in components and how to compose them.
Here is an image of the React components that we need to implement for Minesweeper.

![React components architecture](/images/minesweeper/react_comonents_architecture.png)

The final design was to brake down the game in three separate components:

* `MineSquare` - will host a single square that is a possible mine or just empty square.
* `MineField` - will host the game container with a grid (rows x columns) of mines.
* `Timer` - will be an external component that will show the elapsed time since the game started.

 


