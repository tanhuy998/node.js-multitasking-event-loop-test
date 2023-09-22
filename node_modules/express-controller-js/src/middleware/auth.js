const {preprocessDescriptor} = require('../decorator/utils');
const {RouteContext} = require('../http/httpRouting.js');
const {Middleware} = require('./middleware.js');

class Authentication {

    static #handler;
    static #authorize;

    static setHandler(_func) {

        this.#handler = _func;
    }

    static setAuthorize(_func) {

        this.#authorize = _func;
    }

    static get handler() {

        return this.#handler;
    } 

    static get authoreizeFunction() {

        return this.#authorize;
    }
}

function authOnClass(_class) {

    const symbol = RouteContext.startSession();

    return _class;
}

function initialize(_class, _method, descriptor) {

    //const decoratedResult = preprocessDescriptor(_class, _method, descriptor);

    const authenticateFunction = Authentication.handler;

    if (!authenticateFunction) throw new Error('Athenticate error: there\'s no handler function setted to "Authentication"');

    return Middleware.before(authenticateFunction);
}

function authenticate(...args) {

    const authenticateFunction = Authentication.handler;

    if (!authenticateFunction) throw new Error('Athenticate error: there\'s no handler function setted to "Authentication"');

    const callback = Middleware.before(authenticateFunction);

    if (args.length == 0) {

        const sessionSymbol = RouteContext.startSession();


        return function(_class) {

            

            return _class;
        }
    }
    else if (args.length == 3) {

        const [_class, _method, descriptor] = args;

        return callback(_class, _method, descriptor);
    }
}

function Authorize(_role) {

    return function(...args) {

        const result = authenticate(...args);

        if (result.constructor.name == 'MethodDecorator') {


        }
        else {


        }
    }
}

module.exports = {Authentication, authenticate, Authorize};