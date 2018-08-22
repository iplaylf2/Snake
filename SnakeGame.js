var SnakeGame = (() => {
    var { Direction, Core } = SnakeCore;

    var GameStatus = {
        Stop: 0, Play: 1, Pause: 2
    };

    var GameProgress = {
        Play: 0, Win: 1, Defeat: 2
    };
    //定制规则和进度控制等等
    var Game = (() => {
        var Game = function () {
            var [onTurnInvoke, onTurn] = GetEvent();
            var [onMoveInvoke, onMove] = GetEvent();
            var [onBiteItselfInvoke, onBiteItself] = GetEvent();
            var [onDieInvoke, onDie] = GetEvent();
            var [onGrowInvoke, onGrow] = GetEvent();
            var [onCrossInvoke, onCross] = GetEvent();
            var [onGetFoodInvoke, onGetFood] = GetEvent();
            var [onSetFoodInvoke, onSetFood] = GetEvent();
            var [onLoadInvoke, onLoad] = GetEvent();
            var [onGradeInvoke, onGrade] = GetEvent();
            var [onDefeatInvoke, onDefeat] = GetEvent();
            var [onWinInvoke, onWin] = GetEvent();

            var core = new Core();
            var progress = GameProgress.Play;
            var status = GameStatus.Stop;
            var score;
            var tid;
            var config = {};
            var newConfig = {};

            var InitializeCore = function () {
                core.onTurn.Add(onTurnInvoke);
                core.onMove.Add(onMoveInvoke);
                core.onBiteItself.Add(onBiteItselfInvoke);
                core.onDie.Add(content => {
                    onDieInvoke(content);
                    Defeat();
                });
                core.onGrow.Add((content, eventArgument) => {
                    onGrowInvoke(content, eventArgument);
                    Grade();
                    if (content.snake.length === content.sandTable.area) {
                        Win();
                    }
                });
                core.onCross.Add(onCrossInvoke);
                core.onGetFood.Add(onGetFoodInvoke);
                core.onSetFood.Add(onSetFoodInvoke);
                core.onLoad.Add(onLoadInvoke);
            };

            var Turn = function (direction) {
                core.Turn(direction);
            };

            var Grade = function () {
                var goal = 1000 / config.delay;
                score += goal;
                var eventArgument = {
                    goal
                };
                onGradeInvoke(core.state, eventArgument);
            };

            var Defeat = function () {
                progress = GameProgress.Defeat;
                var eventArgument = {
                    score
                };
                onDefeatInvoke(core.state, eventArgument);
                Stop();
            };

            var Win = function () {
                progress = GameProgress.Win;
                var eventArgument = {
                    score
                };
                onWinInvoke(core.state, eventArgument);
                Stop();
            };

            var BeginBeat = function () {
                tid = setInterval(() => {
                    core.Move();
                }, config.delay);
            };

            var StopBeat = function () {
                clearInterval(tid);
            };

            var LoadConfig = function () {
                if (config.width === newConfig.width && config.height === newConfig.height) {
                    core.Reset();
                }
                else {
                    config.width = newConfig.width;
                    config.height = newConfig.height;
                    core.Run(config);
                }

                config.delay = newConfig.delay;
            };

            var Play = function () {
                if (status === GameStatus.Stop) {
                    LoadConfig();
                    BeginBeat();
                    progress = GameProgress.Play;
                    status = GameStatus.Play;
                    score = 0;
                }
            };

            var Pause = function () {
                if (status === GameStatus.Play) {
                    StopBeat();
                    status = GameStatus.Pause;
                }
            };

            var Resume = function () {
                if (status === GameStatus.Pause) {
                    BeginBeat();
                    status = GameStatus.Play;
                }
            };

            var Stop = function () {
                if (status === GameStatus.Play) {
                    StopBeat();
                    status = GameStatus.Stop;
                } else if (status === GameStatus.Pause) {
                    status = GameStatus.Stop;
                }
            };

            var SetConfig = function (c) {
                newConfig = {
                    width: c.width,
                    height: c.height,
                    delay: c.delay
                };
            };

            InitializeCore();

            DefineGet(this, {
                content: () => core.state,
                progress: () => progress,
                status: () => status,
                score: () => score,
                config: () => Object.assign({}, config)
            });

            Extend(this, {
                onTurn,
                onMove,
                onBiteItself,
                onDie,
                onGrow,
                onCross,
                onGetFood,
                onSetFood,
                onLoad,
                onGrade,
                onDefeat,
                onWin,
                Turn,
                Play,
                Pause,
                Resume,
                Stop,
                SetConfig
            });
        };

        return Game;
    })();
    return { Direction, GameStatus, GameProgress, Game };
})();