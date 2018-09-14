---
layout: post
title: Minesweeper in TypeScript and React
subtitle: > 
  Implementing Minesweeper clone in TypeScript and React
---

One of the games that I occasionally play to relax is [Minesweeper](https://en.wikipedia.org/wiki/Minesweeper_(video_game)).

Since I wanted to learn [React](https://reactjs.org/) and I'm already familiar with other JavaScript front-end technologies such as [Angular](https://angular.io), implementing this game was an interesting challenge. 

In this post I will try to explain how I did it and maybe learn you how to implement your clone of this or maybe some other game.

If you just want to browse the final solution follow the [GitHub repo link](https://github.com/tdelev/minesweeper-react) or if you just want to [play it click here](todo). 


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

## Game state

So far we have implemented the simple (stateless) components of the game.
To make the game alive we need to implement initialization of new game state (new game) and all possible modifications.

![Game State Loop](/images/minesweeper/game_state_loop.png)

Most of the simple games are following this kind of game loop as in the image above.
The users through the UI are having interactions with the game and generating actions.
Sometimes actions might come just from the time passing, but Minesweeper is not that kind of game.
Then the game acts on these actions by changing the state of the game, which then needs to be rendered back in the UI.

In the case of Minesweeper, the user can make two actions:

* mark mine as potential bomb
* open (or explore) mine
* explore neighbours of already opened mine.

### Generating new game state

Generating new game state means initializing the two-dimensional array of `Mine` objects.
Some of these mines need to be bombs and we make this decision by using pseudo-random number generator to implement sort of uniform probability of a mine being a bomb.
The `BOMBS_PROBABILITY` (by default 0.15 or 15%) is the probability of a mine being a bomb.
While we create mines we generate a pseudo-random number using `Math.random()` which has uniform probability in the range of `0-0.99`.

After we have initialized the game state with `Array<Array<Mine>>` we need to update the `bombs` count of all mines that are near a bomb.
The function `fillBombsCount` does just that, by traversing all the neighbours of a mine and incrementing the bombs count for each neighbour that is a bomb.

The `traverseNeighbours` is the utility function that iterates all eight (top left, top, top right, left, right, bottom left, bottom, bottom right) of the neighbours of a given mine.
 
```typescript
const BOMBS_PROBABILITY = 0.15;

const dx = [-1, 0, 1, -1, 1, -1, 0, 1];
const dy = [-1, -1, -1, 0, 0, 1, 1, 1];

function newGame(rows: number, columns: number): Game {
    let totalBombs = 0;
    let estimatedBombs = Math.floor(rows * columns * BOMBS_PROBABILITY);
    const state = Array(rows).fill(null).map((_, i: number) => {
        return Array(columns).fill(null).map((_, j: number) => {
            const isBomb = Math.random() < BOMBS_PROBABILITY;
            if (isBomb && totalBombs < estimatedBombs) {
                totalBombs += 1;
                return new Mine({ x: i, y: j }, false, -1, false);
            } else {
                return new Mine({ x: i, y: j }, false, 0, false);
            }
        });
    });
    if (totalBombs < estimatedBombs) {
        return newGame(rows, columns);
    }
    fillBombsCount(state);
    return new Game(state, totalBombs);
}

function fillBombsCount(state: Array<Array<Mine>>) {
    state.forEach((row, _) => {
        row.forEach((mine, _) => {
            if (isMine(mine)) {
                traverseNeighbours(state, mine, mineNeighbour => {
                    if (!isMine(mineNeighbour)) {
                        mineNeighbour.bombs += 1;
                    }
                    return mineNeighbour;
                });
            }
        });
    });
}

function traverseNeighbours(fields: Array<Array<Mine>>, startMine: Mine, onField: (field: Mine) => Mine) {
    const start = startMine.position;
    dx.map((x, i) => [x, dy[i]])
        .map(deltas => [start.x + deltas[0], start.y + deltas[1]])
        .filter(indexes => indexes[0] >= 0 
        && indexes[0] < fields.length 
        && indexes[1] >= 0 
        && indexes[1] < fields[0].length)
        .map(indexes => onField(fields[indexes[0]][indexes[1]]));
    /*for (let i = 0; i < dx.length; ++i) {
        let ii = start.x + dx[i];
        let jj = start.y + dy[i];
        if (ii >= 0 && ii < fields.length && jj >= 0 && jj < fields[0].length) {
            onField(fields[ii][jj]);
        }
    }*/
}
```

### Updating game state

The function `update` is a generic function for updating the game state without modifying it.
It iterates all of the game state mines and applies a function `f` that should apply the actual transformation.
This function is used in all functions that need to update the game state in any way.
  
```typescript
function update(game: Game, f: ((b: Mine) => Mine), exploded = false): Game {
    const updated = game.state.slice().map(row => {
        return row.slice().map(field => {
            return f(field);
        });
    });
    return new Game(updated, game.totalBombs, game.exploded || exploded);
}
```

### Mark mine

The function `markMine` is used for two user actions.
The first action is when user wants to mark a field `opened` as a potential mine.
We do that only when the current state of the `opened` field is not opened by updating the game state where set that field as flagged and not opened.
The second action that user can do, when he marks a field `opened` that is already opened is to explore neighbour mines of that field.
 
```typescript
function markMine(game: Game, opened: Mine): Game {
    if (opened.isOpened && !opened.isFlagged) return exploreMine(game, opened);
    return update(game, (field: Mine) => {
        if (field == opened) {
            return new Mine(field.position, false, field.bombs, !field.isFlagged);
        } else {
            return new Mine(field.position, field.isOpened, field.bombs, field.isFlagged);
        }
    });
}
```

#### Exploring mine


```typescript
function exploreMine(game: Game, opened: Mine): Game {
    const updated = update(game, (field: Mine) => field);
    let hitMine = false;
    traverseNeighbours(updated.state, opened, field => {
        if (!field.isOpened && !field.isFlagged) {
            if (isMine(field)) {
                hitMine = true;
            } else {
                field.isOpened = true;
                if (field.bombs == 0) {
                    updateZeros(updated.state, field);
                }
            }
        }
        return field;
    });
    if (hitMine) {
        return endGame(game);
    }
    return updated;
}
```

### Open mine

```typescript
function endGame(game: Game): Game {
    return update(game, (field) => {
        if (isMine(field)) {
            return new Mine(field.position, true, field.bombs, field.isFlagged);
        } else {
            return new Mine(field.position, field.isOpened, field.bombs, field.isFlagged);
        }
    }, true);
}

function openMine(game: Game, field: Mine): Game {
    if (field.isFlagged) return game;
    else if (isMine(field)) {
        return endGame(game);
    } else {
        const openField = (openedField: Mine) => (field: Mine) => {
            if (field === openedField) {
                return new Mine(field.position, true, field.bombs, false);
            } else {
                return new Mine(field.position, field.isOpened, field.bombs, field.isFlagged);
            }
        };
        let result = update(game, openField(field));
        if (field.bombs == 0) {
            updateZeros(result.state, field);
        }
        return result;
    }
}
```

### Traversing connected zero-bomb fields

```typescript
function updateZeros(fields: Array<Array<Mine>>, start: Mine) {
    traverseNeighbours(fields, start, (field => {
        if (!field.isOpened && !isMine(field)) {
            field.isOpened = true;
            if (field.bombs == 0) {
                updateZeros(fields, field);
            }
        }
        return field;
    }));
}
```

### Check if game is completed

```typescript
function checkCompleted(game: Game): boolean {
    const and = (a: boolean, b: boolean) => a && b;
    return game.state.map(row => {
        return row.map(field => {
            return isMineProcessed(field);
        }).reduce(and);
    }).reduce(and);
}
```

### Count flagged fields

```typescript
function countFlagged(game: Game): number {
    const plus = (a: number, b: number) => a + b;
    return game.state.map(row => {
        return row.map(field => {
            return field.isFlagged ? 1 : 0;
        }).reduce(plus, 0);
    }).reduce(plus, 0);
}
```

## Putting all together in App component

Now we need to put all together by implementing all the actions in the game as modifications of the game state.
The actions in the game come from the user interaction with components as events.
Handling these events means modifying the state, which then needs to be rendered on the UI.