var { DefineGet, Extend, GetEvent } = (() => {
    var DefineGet = function (object, property) {
        var config = {};
        for (var key in property) {
            config[key] = {
                get: property[key],
                enumerable: true
            };
        }
        Object.defineProperties(object, config);
    };

    var Extend = function (object, property) {
        Object.assign(object, property);
    };

    var GetEvent = function () {
        var set = new Set();
        var Invoke = function (...args) {
            for (var func of set) {
                func(...args);
            }
        };
        var Add = function (func) {
            set.add(func);
        };
        var Remove = function (func) {
            set.delete(func);
        };
        return [
            Invoke,
            { Add, Remove }
        ];
    };

    return { DefineGet, Extend, GetEvent };
})();