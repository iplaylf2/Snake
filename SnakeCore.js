var SnakeCore = (() => {
    var Direction = {
        Up: 0, Right: 1, Down: 2, Left: 3
    };
    //蛇
    var Snake = (() => {
        var PointToKey = function ({ x, y }) {
            return `${x},${y}`;
        };

        var Snake = function ({ x, y }) {
            var [onTurnInvoke, onTurn] = GetEvent();
            var [onMoveInvoke, onMove] = GetEvent();
            var [onBiteItselfInvoke, onBiteItself] = GetEvent();
            var [onDieInvoke, onDie] = GetEvent();
            var [onGrowInvoke, onGrow] = GetEvent();

            var alive = true;
            var readyDirection = Direction.Down;
            var moveDirection = readyDirection;
            var step = { x: 0, y: 1 };
            var bodyList = [{ x, y }];
            var bodySet = new Set([PointToKey({ x, y })]);
            var ghost;

            var GetBody = function () {
                return bodyList.map(({ x, y }) => Object({ x, y }));
            };

            var Bite = function ({ x, y }) {
                return bodyList[0].x === x && bodyList[0].y === y;
            };

            var Touch = function ({ x, y }) {
                return bodySet.has(PointToKey({ x, y }));
            };

            var Turn = function (direct) {
                if (alive) {
                    if (direct === readyDirection || Math.abs(direct - moveDirection) === 2) {
                        return;
                    }
                    else {
                        readyDirection = direct;
                    }
                    switch (direct) {
                        case Direction.Up:
                            step = { x: 0, y: -1 };
                            break;
                        case Direction.Right:
                            step = { x: 1, y: 0 };
                            break;
                        case Direction.Down:
                            step = { x: 0, y: 1 };
                            break;
                        case Direction.Left:
                            step = { x: -1, y: 0 };
                            break;
                        default:
                            throw direct;
                    }
                    var eventArgument = {
                        direction: direct
                    };
                    onTurnInvoke(state, eventArgument);
                }
            };

            var Move = function () {
                if (alive) {
                    moveDirection = readyDirection;
                    var point = {
                        x: bodyList[0].x + step.x,
                        y: bodyList[0].y + step.y
                    };
                    ghost = bodyList.pop();
                    bodySet.delete(PointToKey(ghost));
                    var touch = Touch(point);
                    bodyList.unshift(point);
                    bodySet.add(PointToKey(point));

                    var eventArgument = {
                        move: Object.assign({}, point),
                        remove: Object.assign({}, ghost),
                        touch
                    };
                    onMoveInvoke(state, eventArgument);
                    if (touch) {
                        BiteItself(point);
                    }
                }
            };

            var BiteItself = function (haed) {
                var eventArgument = {
                    head: Object.assign({}, haed)
                };
                onBiteItselfInvoke(state, eventArgument);
                Die();
            };

            var Die = function () {
                if (alive) {
                    alive = false;
                    onDieInvoke(state);
                }
            };

            var Grow = function () {
                if (alive) {
                    bodyList.push(ghost);
                    bodySet.add(PointToKey(ghost));
                    var eventArgument = {
                        add: Object.assign(ghost)
                    };
                    onGrowInvoke(state, eventArgument);
                }
            };

            var state = {};
            DefineGet(state, {
                alive: () => alive,
                direction: () => readyDirection,
                head: () => Object.assign({}, bodyList[0]),
                tail: () => Object.assign({}, bodyList[bodyList.length - 1]),
                length: () => bodyList.length,
                GetBody: () => GetBody,
                Bite: () => Bite,
                Touch: () => Touch,
            });

            Extend(this, {
                state,
                onTurn,
                onMove,
                onBiteItself,
                onDie,
                onGrow,
                Turn,
                Move,
                Die,
                Grow,
            });
        };
        return Snake;
    })();
    //地图
    var SandTable = (() => {
        var SandTable = function ({ width, height }) {
            var area = width * height;

            var Cross = function ({ x, y }) {
                return x < 0 || x >= width || y < 0 || y >= height;
            };

            DefineGet(this, {
                width: () => width,
                height: () => height,
                area: () => area,
                Cross: () => Cross
            });
        };
        return SandTable;
    })();
    //核心玩法
    var Core = (() => {
        var Core = function () {
            var [onTurnInvoke, onTurn] = GetEvent();
            var [onMoveInvoke, onMove] = GetEvent();
            var [onBiteItselfInvoke, onBiteItself] = GetEvent();
            var [onDieInvoke, onDie] = GetEvent();
            var [onGrowInvoke, onGrow] = GetEvent();
            var [onCrossInvoke, onCross] = GetEvent();
            var [onGetFoodInvoke, onGetFood] = GetEvent();
            var [onSetFoodInvoke, onSetFood] = GetEvent();
            var [onLoadInvoke, onLoad] = GetEvent();

            var sandTable;
            var snake;
            var food;
            var config;

            var Load = function () {
                sandTable = new SandTable(config);
                point = { x: Math.floor(sandTable.width / 2), y: Math.floor(sandTable.height / 2) };
                snake = new Snake(point);

                snake.onTurn.Add((_, eventArgument) => {
                    onTurnInvoke(state, eventArgument);
                });

                snake.onMove.Add((_, eventArgument) => {
                    onMoveInvoke(state, eventArgument);
                    if (snake.state.alive) {
                        Position();
                    }
                });

                snake.onBiteItself.Add((_, eventArgument) => {
                    onBiteItselfInvoke(state, eventArgument);
                });

                snake.onDie.Add(() => {
                    onDieInvoke(state);
                });

                snake.onGrow.Add((_, eventArgument) => {
                    onGrowInvoke(state, eventArgument);
                });

                SetFood();
                onLoadInvoke(state);
            };

            var Turn = function (direction) {
                snake.Turn(direction);
            };

            var Move = function () {
                snake.Move();
            };

            var Position = function () {
                if (sandTable.Cross(snake.state.head)) {
                    var eventArgument = {
                        head: snake.state.head
                    };
                    onCrossInvoke(state, eventArgument);
                    snake.Die();
                }
                else {
                    FindFood();
                }
            };

            var FindFood = function () {
                if (snake.state.Bite(food)) {
                    var eventArgument = {
                        head: snake.state.head
                    };
                    onGetFoodInvoke(state, eventArgument);
                    snake.Grow();
                    SetFood();
                }
            };

            var SetFood = function () {
                if (snake.state.length === sandTable.area) {
                    food = { x: -1, y: -1 };
                }
                else {
                    do {
                        food = {
                            x: Math.floor(Math.random() * sandTable.width),
                            y: Math.floor(Math.random() * sandTable.height)
                        };
                    } while (snake.state.Touch(food));
                    var eventArgument = {
                        food: Object.assign({}, food)
                    };
                    onSetFoodInvoke(state, eventArgument);
                }
            };

            var Run = function (c) {
                config = c;
                Load();
            };

            var Reset = function () {
                Load();
            };

            var state = {};
            DefineGet(state, {
                snake: () => snake.state,
                sandTable: () => sandTable,
                food: () => Object.assign({}, food)
            });

            Extend(this, {
                state,
                onTurn,
                onMove,
                onBiteItself,
                onDie,
                onGrow,
                onCross,
                onGetFood,
                onSetFood,
                onLoad,
                Turn,
                Move,
                Run,
                Reset
            });
        };
        return Core;
    })();

    return { Direction, Core };
})();