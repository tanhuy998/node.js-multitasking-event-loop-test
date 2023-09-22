//const { obj } = require("../model/chatroom/chatRoom.schema");
const {DecoratorResult} = require('../decorator/decoratorResult.js');
//const {httpContext} = require('./requestDispatcher.js');

const decoratorContext = {}


function annotation(_theConstructor) {

    const reg_detemine_classname = /function\s\w+/;
    
    const className = _theConstructor.toString()
                        .match(/function\s\w+/)[0]
                        .replace('function ', '');

    decoratorContext.currentClass = _theConstructor;

    return _theConstructor;
}

function dispatchable(_class) {

    _class.action = new Proxy(_class, BaseController.proxyHandler);

    return _class;
}

class BaseController  {

    static httpContext;

    static proxyHandler = {

        get: (target, prop) => {

            if (prop == 'proxy') return target.proxy;
    
            const result = [];
    
            result.push(target);
            result.push(prop);

            return result;
        }
    };
    static proxy = new Proxy(BaseController, BaseController.proxyHandler);

    //@httpContext
    #context;
    #decoratedList;

    constructor() {
        this.#decoratedList = [];
    }

    setContext(_httpContext) {

        if (!this.#context) {

            this.#context = _httpContext;
        }
    }

    pushDecoratedProp(decoratedResult) {
        
        this.#decoratedList.push(decoratedResult);
    }

    resolveProperty() {

        const props = Object.getOwnPropertyNames(this);

        for (const propName of props) {

            if (this[propName] == undefined) continue;

            if (this[propName].constructor.name == 'PropertyDecorator') {

                this[propName].bind(this).resolve();
            }
        }
    }

    get httpContext() {

        return this.#context;
    }
};

module.exports = {BaseController, annotation, dispatchable};
