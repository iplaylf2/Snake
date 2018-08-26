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
            var config = {
                width: 10,
                height: 10
            };
            var progress = GameProgress.Play;
            var status = GameStatus.Stop;
            var tid;
            var score;
            var level;
            const levelCount = 20;
            const maxDelay = 1000;
            const minDelay = 100;
            const delayTable = new Array(levelCount)
                .fill(0)
                .map((_, i) => maxDelay / ((maxDelay / minDelay - 1) * i / (levelCount - 1) + 1));

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

                    var progress = Math.floor(content.snake.length / (content.sandTable.area / levelCount));
                    if (progress !== level) {
                        level = progress;
                        AfreshBeat();
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
                var goal = 1;
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
                }, delayTable[level]);
            };

            var StopBeat = function () {
                clearInterval(tid);
            };

            var AfreshBeat = function () {
                StopBeat();
                BeginBeat();
            };

            var Play = function () {
                if (status === GameStatus.Stop) {
                    core.Run(config);
                    level = 0;
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

            InitializeCore();

            DefineGet(this, {
                content: () => core.state,
                progress: () => progress,
                status: () => status,
                score: () => score
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
                Stop
            });
        };

        return Game;
    })();
    return { Direction, GameStatus, GameProgress, Game };
})();