---
layout: post
title: Minesweeper in TypeScript and React
subtitle: > 
  Implementing Minesweeper clone in TypeScript and React
---

One of the games that I occasionally play to relax is Minesweeper.
Minesweeper is a game ...

Since I wanted to learn React and I'm already familiar with other JavaScript front-end technologies such as Angular, implementing this game was an interesting challenge. 

In this post I will try to explain how I did it and maybe learn you how to implement your clone of this or maybe some other game. 


## Before we start

You will need to have installed (or install) on your machine:
 
* [NodeJS](https://nodejs.org) and [npm](https://nodejs.org)
* [Yarn](https://yarnpkg.com/en/docs/install) (optional)
* [Create React App](https://github.com/facebook/create-react-app)

## Creating React Application

We will bootstrap the React project with using the option `--script-version=react-script-ts` that would instruct `create-react-app` to use [Create React App (with TypeScript)](https://github.com/wmonk/create-react-app-typescript) configuration.

[TypeScript + React](https://medium.com/@amcdnl/react-typescript-%EF%B8%8F-647aa7d054a9) love
  
```bash
npx create-react-app --scripts-version=react-scripts-ts minesweeper
```

To start the application just execute:

```bash
cd minesweeper
npm start
# or yarn start
```

## Structuring the React app

One of the important steps in implementing any React application is how to brake down the UI in components and how to compose them.
Here is an image of the React components that we need to implement for Minesweeper.

![React components architecture](/images/minesweeper/react_comonents_architecture.png)

The final design was to brake down the game in three separate components:

* `MineSquare` - will host a single square that is a possible mine or just empty square.
* `MineField` - will host the game container with a grid (rows x columns) of mines.
* `Timer` - will be an external component that will show the elapsed time since the game started.

Next create a directory `components` in your `src` directory and create a separate files for the listed components.
 
This is how an empty component should look like:
 
 ```tsx
import * as React from "react";

export class MineField extends React.Component {

    render() {
        return (
            <div className="game-board">
                {'MineField'}
            </div>
        );
    }
}
```

One option to create React component in TypeScript is to create a class extend from the class `React.Component`.

## Minesweeper game domain

```typescript
export interface Point {
    x: number;
    y: number;
}

/**
 * bombs = -1 - it is a bomb
 * bombs >= 0 - count of bombs around
 */
export class Mine {
    constructor(public position: Point,
                public isOpened = false,
                public bombs = 0,
                public isFlagged = false,
    ) {
    }
}

export class Game {
    constructor(public state: Array<Array<Mine>>,
                public totalBombs = 0,
                public exploded = false
    ) {
    }
}
```
The game Minesweeper is represented as two-dimensional array (matrix) of mines `Array<Array<Mine>>` or `Mine[][]`.
Each `Mine` has:

* `position` (x,y coordinates) in the matrix of mines
* `isOpened` a boolean field which is true when a mine field is opened
* `bombs` a number which encodes if there is a bomb in this mine (-1) or if positive it is a count of bombs around that mine
* `isFlagged` which represents if the mine is marked (flagged) by the user as potential bomb.

> It was really hard to get the naming right for the Mine domain.

The `Game` class represents the state of the Minesweeper game which is the two dimensional array of mines and auxiliary fields for the count of total bombs and state if there is exploded bomb (game is finished). 

## MineSquare component

## MineField component

## Timer component