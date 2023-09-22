const {EventEmitter} = require('node:events');

class PreInvokeFunction extends EventEmitter{

    #callback;
    #args;
    #context;

    constructor(_callback, ...args) {

        super();

        if (_callback.constructor.name == 'Function') this.#callback = _callback;

        this.#args = args;

        // return new Proxy(this, {
        //     context: this.#context,
        //     get: (target, prop) => {

        //         if (target[prop].constructor.name == 'Function') return target[prop].bind(this.context);

        //         return target[prop];
        //     },
        //     apply: (target, thisArg, args) => {

        //         //console.log('function invoked')
        //         return target.invoke();
        //     }
        // })

        this.#Init();
    }

    #Init() {

        this.#InitEvents();
    }

    #InitEvents() {

        this.on('fulfill', (_result, target, method) => {});
    }

    bind(object) {

        this.#context = object;

        return this;
    }

    invoke() {

        if (!this.#context) return this.#callback(...this.#args);

        const result = this.#callback.call(this.#context, ...this.#args)

        this.emit('fulfill', result, this.#callback ,this.#context);

        return result;
    }

    whenFulfill(_callback) {

        this.on('fulfill', _callback);
    }

    passArgs(..._args) {

        this.#args = _args;

        return this;
    }

    get args() {

        return this.#args;
    }
}

module.exports = PreInvokeFunction;