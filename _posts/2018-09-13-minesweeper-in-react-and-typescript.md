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

```
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

The game domain are the classes and data structures used to represent the state of the game.

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

The `MineSquare` component will be **stateless** (pure functional).
That means that it should render the property `field: Mine` and just propagate an event when interaction happens (instead of keeping and mutating state).

```tsx
export class MineSquare extends React.Component<MineProps> {

    renderField(field: Mine) {
        if (field.isOpened) {
            if (field.bombs > 0) {
                return (<span className={`bombs-${field.bombs}`}>{field.bombs}</span>);
            } else if (field.bombs == 0) {
                return ''
            } else {
                return (<i className='fas fa-xs fa-bomb bomb'/>);
            }
        } else {
            if (field.isFlagged) {
                return (<i className='fas fa-xs fa-flag'/>);
            } else {
                return '';
            }
        }
    }

    render() {
        const field = this.props.field;
        return (
            <button className={'mine-button' + (field.isOpened ? '' : ' mine-opened')}
                    tabIndex={this.props.index}
                    onClick={() => this.props.onLeftClick(field)}>
                {this.renderField(field)}
            </button>
        );
    }
}

export interface MineProps {
    index: number;
    field: Mine;
    onLeftClick: (field: Mine) => void;
}
```

The `Mine` will be rendered as HTML `button` element since the click is the natural interaction for this HTML element.
Depending on the state of the `field: Mine` we will render the different content inside the `button` element.
The function `renderField(field: Mine)` does exactly that.
So when the field is opened (user explored that field) it can be:

* `bombs == -1` so we render a bomb (using FontAwesome bomb icon for this)
* `bombs == 0` the field is just empty
* `bombs > 0` we render the number of bombs in that field.

The component propagates the mouse `onClick` event to indicate user interaction with this field.


> In minesweeper there are two types of interaction user can have with field, to explore it or to flag it as potential mine.
Maybe better choice was to represent these with different events such as mouse **left** and **right** click.
But because of a buggy behaviour of the right click, my final choice was to encode these two different events with only left click and a pressed state of a certain keyboard key (_ctrl_ in my case). 

## MineField component

The `MineField` component is also stateless and will just render the full state of the game (the two-dimensional array of mines).
Each `field` is rendered as a `MineSquare` component.
It will also propagate the click event from each `MineSquare` component.

```tsx
export class MineField extends React.Component<MineFieldProps> {

    render() {
        return (
            <div className="game-board">
                {
                    this.props.game.state.map((row, i) => {
                        return (
                            <div key={i} className="board-row">
                                {
                                    row.map((field, j) => {
                                        return (
                                            <MineSquare key={`${i}-${j}`}
                                                        index={j + row.length}
                                                        field={field}
                                                        onLeftClick={(field) => this.props.onLeftClick(field)}/>
                                        );
                                    })
                                }
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

export interface MineFieldProps {
    game: Game;
    onLeftClick: (field: Mine) => void;
}
```

This component is very simple, it should just render the two-dimensional array of mines as grid.
Each row is grouped in a separate HTML container `div` element and with CSS it is all aligned.
To uniquely identify each row we can use the row index `i` as a React `key` property, and for each `MineSquare` component the `key` would be the combination of indices `i` and `j` (the current row and column).

## Timer component

The `Timer` is another stateless component responsible for rendering the elapsed seconds since the game started.
To render the `seconds` in appropriate format `00:00` it uses a custom function `secondsToString` from our utility module named `time`.

```tsx
export class Timer extends React.Component<TimerProps> {

    render() {
        return (
            <h3>{time.secondsToString(this.props.elapsedSeconds)}</h3>
        );
    }
}

export interface TimerProps {
    elapsedSeconds: number;
}
```
k
Here is the implementation of the `secondsToString` function.
 
```typescript
function leadZero(num: number) {
    return num < 10 ? `0${num}` : `${num}`;
}

export const time = {
    secondsToString: function (seconds: number) {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${leadZero(min)}:${leadZero(sec)}`;
    }
};
```

> One of the known drawbacks of TypeScript and JavaScript language in general is the lack of powerful standard library.
But instead of relying on myriad of external modules for simple functions such as `leadZero` or `secondsToString` it think it's better to just implement them.

## Putting all together in App component

So far we have implemented the simple (stateless) components of the game.
Now we need to put all together by implementing all the actions in the game as modifications of the game state.
The actions in the game come from the user interaction with components as events.
Handling these events means modifying the state, which then needs to be rendered on the UI.

![Game State Loop](/images/minesweeper/game_state_loop.png)

Most of the simple games are following this kind of game loop as in the image above.
The users through the UI are having interactions with the game and generating actions.
Sometimes actions might come just from the time passing, but Minesweeper is not that kind of game.
Then the game acts on these actions by changing the state of the game, which then needs to be rendered back in the UI.

In the case of Minesweeper, the user can make two actions:

* mark mine as potential bomb
* open (or explore) mine
* explore neighbours of already opened mine.

