---
layout: post
title: Minesweeper in TypeScript and React
subtitle: > 
  Implementing Minesweeper clone in TypeScript and React
---

One of the games that I occasionally like play and relax is [Minesweeper](https://en.wikipedia.org/wiki/Minesweeper_(video_game)).

I have extensive experience with JavaScript front-end technologies starting from jQuery and nowadays [Angular](https://angular.io).
Being open to new technologies I have tried [React](https://reactjs.org/) in few hello world projects.
Implementing Minesweeper in TypeScript and React seemed like an interesting challenge and opportunity to learn more. 

In this post I will try to explain how I did it and maybe encourage or learn you how to implement your clone of this or maybe some other game.

If you're just interested in seeing the final solution visit or clone the [GitHub repository](https://github.com/tdelev/minesweeper-react) orr if you just want to **play** it click [here](https://delev.me/minesweeper-react).

## Before we start

You will need to have installed (or install) on your machine:
 
* [NodeJS](https://nodejs.org) and [npm](https://nodejs.org)
* [Yarn](https://yarnpkg.com/en/docs/install) (optional)
* [Create React App](https://github.com/facebook/create-react-app)

## Creating React Application

We will bootstrap the React project with using the option `--script-version=react-script-ts` that would instruct `create-react-app` to use [Create React App (with TypeScript)](https://github.com/wmonk/create-react-app-typescript) configuration.

> In my previous experience with Angular I find TypeScript a real joy to work.
And having daily experience with statically typed languages (Java, Kotlin) I was not interested in using pure ES6.
On the other side, learning and investing time in Flow was not worth it having a previous (great) experience with TypeScript.
Read [this great article](https://medium.com/@amcdnl/react-typescript-%EF%B8%8F-647aa7d054a9) to find out more about using TypeScript + React.
  
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
On the following image is the structure of the React components that we will need to implement for Minesweeper.

![React components architecture](/images/minesweeper/react_comonents_architecture.png)

The final design was to brake down the game in three separate components:

* `MineSquare` - will host a single square that is a possible mine, number indicating of neighbour bombs or just empty square if no bombs around
* `MineField` - will host the game container as a grid (rows x columns) of mines
* `Timer` - will be an external component that will show the elapsed time since the game started.

Next create a directory `components` in your `src` directory and create a separate file for each of the listed components.
 
This is how an empty component should look like:
 
 ```tsx
import * as React from "react";

export const MineField = (props: PropType) => (
    <div className="game-board">
        {'MineField'}
    </div>
);
```

In React you can create components as class that extends the `React.Component` class or as functions (possibly arrow) for functional (stateless) components.

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
* `bombs` a number which encodes if there is a bomb (-1) or positive number representing the count of bombs around that mine.
* `isFlagged` which represents if the mine is marked (flagged) by the user as potential bomb.

> It was really hard to get the naming right for the game domain, having to deal with mines/bombs, mine field as single field with mine or field of mines :).

The `Game` class represents the state of the Minesweeper game which is the two dimensional array of mines.
Also it contains auxiliary fields for the count of total bombs and state if there is exploded bomb (game is finished). 

## MineSquare component

The `MineSquare` is a **functional** (stateless) component.
That means that it should render the property `field: Mine` and just propagate an event when interaction happens.
It can not keep or mutate any state.

```tsx
export const MineSquare = (props: MineProps) => {
    const field = props.field;
    return (
        <button className={'mine-button' + (field.isOpened ? '' : ' mine-opened')}
                tabIndex={props.index}
                onClick={() => props.onLeftClick(field)}>
            {renderField(field)}
        </button>
    );
};

function renderField(field: Mine) {
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

* `bombs == -1` so we render a bomb (using [FontAwesome](https://fontawesome.com/v4.7.0/) bomb icon for this)
* `bombs == 0` the field is just empty
* `bombs > 0` we render the number of bombs in that field.

When the field is opened and flagged we render a flag icon.

The component propagates the mouse `onClick` event to indicate user interaction with this field.

> In minesweeper there are two types of interaction user can have with a field, to explore it or to flag it as potential mine.
Maybe better choice is to represent these with different events such as mouse **left** and **right** click.
But because of a buggy behaviour of the right click, my final choice was to encode these two different events with only left click and a pressed state of a certain keyboard key (_ctrl_ in my case). 

## MineField component

The `MineField` component is also functional and is responsible of rendering the full state of the game (the two-dimensional array of mines).
Each `field` is rendered as a separate `MineSquare` component.
It will also propagate the click event from each `MineSquare` component.

```tsx
export const MineField = (props: MineFieldProps) => (
    <div className="game-board">
        {
            props.game.state.map((row, i) => (
                    <div key={i} className="board-row">
                        {
                            row.map((field, j) => (
                                    <MineSquare key={`${i}-${j}`}
                                                index={j + row.length}
                                                field={field}
                                                onLeftClick={(field) => props.onLeftClick(field)}/>
                                )
                            )
                        }
                    </div>
                )
            )
        }
    </div>
);

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
export const Timer = (props: TimerProps) => (
    <h3>{time.secondsToString(props.elapsedSeconds)}</h3>
);

export interface TimerProps {
    elapsedSeconds: number;
}
```

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
But instead of relying on myriad of external modules for simple functions such as `leadZero` or `secondsToString` I think it's better to just implement them.

## Game state

So far we have implemented the simple (stateless) components of the game.
To make the game alive we need to implement initialization of new game state (new game action) and all possible modifications.

![Game State Loop](/images/minesweeper/game_state_loop.png)

Most of the simple games are following some kind of game loop as shown in the image above.
The users through the UI are having interactions with the game and are generating actions.
Sometimes actions are generated automatically as the time passing, but in Minesweeper that is not the case.
On each action, the state of the game is modified and then rendered back on the UI.

In the case of Minesweeper, the user can make three possible actions on not opened field (mine square):

* mark it as potential bomb
* open it

and if the field is already opened the user can explore neighbours.

### Generating new game state

Generating new game state means initializing the two-dimensional array of `Mine` objects.
Some of these mines need to be bombs and we make this decision by using pseudo-random number generator to implement sort of uniform distribution of a mine being a bomb.
The `BOMBS_PROBABILITY` (by default 0.15 or 15%) is the probability of a mine having a bomb.
While we create mines we generate a pseudo-random number using `Math.random()` which has generates a double with uniform distribution in the range of `0-0.99`.

After we have initialized the game state with `Array<Array<Mine>>` we need to update the `bombs` count of all mines that are neighbouring a bomb.
The function `fillBombsCount` does just that, by traversing all the neighbours of a mine and incrementing the bombs count for each neighbour that is a bomb.

The `traverseNeighbours` is the utility function that iterates all eight (top left, top, top right, left, right, bottom left, bottom, bottom right) of the neighbours of a given mine.
 
```typescript
const BOMBS_PROBABILITY = 0.15;

const dx = [-1, 0, 1, -1, 1, -1, 0, 1];
const dy = [-1, -1, -1, 0, 0, 1, 1, 1];

function newGame(rows: number, columns: number): Game {
    let totalMines = 0;
    let estimatedMines = Math.floor(rows * columns * BOMBS_PROBABILITY);
    const state = Array(rows).fill(null).map((r, i: number) => {
        return Array(columns).fill(null).map((c, j: number) => {
            const isMine = Math.random() < BOMBS_PROBABILITY;
            if (isMine) {
                totalMines += 1;
                return new Mine({x: i, y: j}, false, -1, false);
            } else {
                return new Mine({x: i, y: j}, false, 0, false);
            }
        });
    });
    while (totalMines < estimatedMines) {
        const randX = Math.floor(Math.random() * rows);
        const randY = Math.floor(Math.random() * columns);
        if (!isMine(state[randX][randY])) {
            ++totalMines;
            state[randX][randY].bombs = -1;
        }
    }
    if (totalMines > estimatedMines) {
        const mines = state.map(row => row.filter(mine => !isMine(mine)))
            .reduce((prev, current) => prev.concat(current));

        while (totalMines > estimatedMines) {
            const randMineIndex = Math.floor(Math.random() * mines.length);
            mines[randMineIndex].bombs = 0;
            --totalMines;
        }
    }
    fillBombsCount(state);

    return new Game(state, totalMines);
}

function traverseNeighbours(fields: Array<Array<Mine>>, startMine: Mine, onField: (field: Mine) => Mine) {
    let inBounds = (point: Point) => point.x >= 0 && point.x < fields.length &&
        point.y >= 0 && point.y < fields[0].length;
    const start = startMine.position;
    dx.map((x, i) => ({dx: x, dy: dy[i]}))
        .map(deltas => ({x: start.x + deltas.dx, y: start.y + deltas.dy}))
        .filter((point: Point) => inBounds(point))
        .map((point: Point) => onField(fields[point.x][point.y]));
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
It iterates all of the game state mines and applies a function `f` that should apply the actual transformation for a mine.
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

### Mark mine field

The function `markMine` is used for two user actions.
The first action is when user wants to mark a mine field as a potential bomb.
We do that, only when the current state of the field is not opened by updating the game state where we set that field as flagged and not opened.
The second possible action for a user is to explore already opened field that has a count of bombs.
 
```typescript
function markMine(game: Game, opened: Mine): Game {
    if (opened.isOpened && !opened.isFlagged) return exploreOpenedField(game, opened);
    return update(game, (field: Mine) => {
        if (field == opened) {
            return new Mine(field.position, false, field.bombs, !field.isFlagged);
        } else {
            return new Mine(field.position, field.isOpened, field.bombs, field.isFlagged);
        }
    });
}
```

#### Exploring opened field

To explore open field is a potentially game ending action that needs to explore all neighbour fields of that field.
The opened field that a user explores must have all its neighbour bombs flagged right.
If a neighbour field that is a bomb is not flagged, the game ends.

```typescript
function exploreOpenedField(game: Game, opened: Mine): Game {
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

To implement this function we use the generic `traverseNeighbours` and for each neighbour field that is **not opened** and **not flagged**:

* if it's a mine we should end the game
* if it's not we should set as opened and if we open a zero-bomb field we should open all other connected zero-bomb fields.

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

The function `updateZeros` traverses using a recursive DFS (Depth-First Search) algorithm all connected zero-bomb fields.

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

On each state modifying action we need to check if the state of game has reached an end state.
For the game Minesweeper that state is when all the fields are explored correctly.
That means that a mine field that contains a bomb is flagged and otherwise it's opened.
 
```typescript
function checkCompleted(game: Game): boolean {
    const and = (a: boolean, b: boolean) => a && b;
    return game.state.map(row => {
        return row.map(field => {
            return isMineCovered(field);
        }).reduce(and);
    }).reduce(and);
}
function isMineCovered(field: Mine) {
    if (isMine(field)) {
        return field.isFlagged;
    } else {
        return field.isOpened;
    }
}
```

The function `checkCompleted` checks for the end state by iterating all fields and mapping them in to a `boolean` value.
The `true` value means field is explored correctly and `false` means not explored correctly.
Combining all these values using logical AND would yield final `true` only if all fields are explored correctly, which would mean the end state is reached.
  
### Count flagged fields

The function `countFlagged` is used to count all the flagged fields in the game state to show the current progress of flagged/total bombs.

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

Once we have implemented all the game state modifications and checks we can put it all together.
The actual game state is initialized and modified in the component `App`.

```tsx
class App extends React.Component<AppProps> {
    controlDown = false;
    startTime: Date;
    state = {
        rows: this.props.rows,
        columns: this.props.columns,
        game: game.newGame(this.props.rows, this.props.columns),
        completed: false,
        flagged: 0,
        elapsedSeconds: 0
    };

    isControlKey(code: string) {
        return code === "ControlLeft" || code === "ControlRight";
    }

    timer: any;

    componentDidMount() {
        document.onkeydown = (e: KeyboardEvent) => {
            if (this.isControlKey(e.code)) {
                this.controlDown = true;
            }
        };
        document.onkeyup = (e: KeyboardEvent) => {
            if (this.isControlKey(e.code)) {
                this.controlDown = false;
            }
        };
        this.startTimer();
    }

    startTimer() {
        this.startTime = new Date();
        this.timer = setInterval(() => {
            const now = new Date();
            const elapsedMs = now.getTime() - this.startTime.getTime();
            this.setState({
                elapsedSeconds: Math.floor(elapsedMs / 1000)
            });
        }, 1000);
    }

    updateState(field: Mine, updateFn: (game: Game, field: Mine) => Game) {
        this.setState((prevState: any, props) => {
            const updatedGame = updateFn(prevState.game, field);
            const completed = game.checkCompleted(updatedGame);
            if (completed || updatedGame.exploded) {
                clearInterval(this.timer);
            }
            return {
                game: updatedGame,
                completed: completed,
                flagged: game.countFlagged(updatedGame)
            };
        });
    }

    public onSquareLeftClick(field: Mine) {
        if (this.controlDown) {
            this.updateState(field, game.openMine);
        } else {
            this.updateState(field, game.markMine);
        }
    }

    startGame(rows: number, columns: number) {
        clearInterval(this.timer);
        this.startTimer();
        this.setState({
            rows: rows,
            columns: columns,
            game: game.newGame(rows, columns),
            completed: false,
            flagged: 0,
            elapsedSeconds: 0
        });
    }

    public render() {
        return (
            <div className="game">
                <div className="menu">
                    <ul className="level-menu">
                        <li onClick={(e) => this.startGame(6, 8)}>Easy</li>
                        <li onClick={(e) => this.startGame(10, 14)}>Medium</li>
                        <li onClick={(e) => this.startGame(20, 30)}>Hard</li>
                    </ul>
                </div>
                <MineField
                    game={this.state.game}
                    onLeftClick={(field: Mine) => this.onSquareLeftClick(field)}/>
                <Timer elapsedSeconds={this.state.elapsedSeconds}/>
                <div className='status'>Completed: {this.state.completed ? 'YES' : 'NO'}</div>
                <div className='status'>{this.state.flagged}/{this.state.game.totalBombs}</div>
                <div className='help'>
                    <h3>How to play</h3>
                    <ol>
                        <li>Left Click to mark possible mine or to explore fields around opened field</li>
                        <li>Ctrl + Left Click to open field</li>
                    </ol>
                </div>
            </div>
        );
    }
}

export interface AppProps {
    rows: number;
    columns: number;
}
```

The final piece of the puzzle, the `App` component is the only stateful component that keeps and modifies the game state.
The state of the component contains:
 
* the number of `rows` and `columns` of the Minesweeper grid
* the game state
* the elapsed seconds since the game started
* the number of flagged fields (computed from the game state)
* and a boolean flag indicated if the game is completed (also computed from the game state).

The state is initialized at the beginning of the component on a new game state.
We use the React lifecycle method `componentDidMount` to bind two keyboard events `onkeydown` and `onkeyup` to track the state of _ctrl_ key.
We also start a timer using JavaScript `setTimeout` function that we use to modify the elapsed seconds state.

The function `updateState` is used to update the state of the React component using `this.setState`.
This is a HOF (higher-order function) that accepts the actual game state modification function as `updateFn` as argument.
Once the game state is modified, the final state of the component is updated and the UI should be rendered.
This function is called on the user generated event `onSquareLeftClick`.
When the `ctrl` button is down a mine is opened and otherwise mine is marked (or explored).

The actual rendering of the UI is pretty simple.
We render a simple menu of three links that allow to start new game with the chosen difficulty.
Then we render the `MineField` component with the current game state and the `Timer` component showing the elapsed seconds.
Finally, we render a information on the current status of the game, such as is it completed and number of flagged fields vs total bombs. 

## Conclusion

Implementing any simple game is an interesting programming challenge.
Many times a challenging part is to implement the game state and functions (algorithms) that mutate the state.
Favouring functional programming I tried to implement most of these functions as mostly pure functions by using functional constructs such as `map` and `reduce`.
Also, three out of four React components are functional (stateless or pure functions).

Hopefully sharing my solution and explaining it in this post was interesting and learning experience. 
If you feel inspired to start learning these technologies by implementing your own Minesweeper or other game, that would be great.
And finally, it would be perfect if you also share your code and experience.
