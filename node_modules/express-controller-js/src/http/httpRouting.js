const {dispatchRequest} = require('../requestDispatcher');
const {preprocessDescriptor} = require('../decorator/utils.js');
//const {decoratorContext} = require('../baseController.js');
const PreInvokeFuncion = require('../callback/preInvokeFunction.js');


//@inheritDecoratorContextClass
class RouteContext {

    static #routerObject;
   
    static #callbackQueue = [];

    static #context = {};///////////////////
    static #currentRoutingContext;//////////////////
    
    static currentPrefix = '';

    static #session = {};
    static #currentSession;

    static #sessionPool = [];

    static controllerAction = {};

    static #isResolved = false;

    static get isResolved() {

        return this.#isResolved;
    }

    // static #hooks = {
    //     beforeDefine: [],
    //     afterDefine: []
    // };

    static get router() {

        return RouteContext.#routerObject;
    }

    static get context() {

        return this.#context;
    }

    constructor() {


    }

    static get currentContext() {

        return RouteContext.#currentRoutingContext;
    } ///////////////

    static get currentSession() {

        return RouteContext.#currentSession;
    }

    static init(_express) {

        if (!RouteContext.router) {

            RouteContext.#routerObject = _express.Router();

            //Route.dequeue();
            return;
        }
    }

    static dequeue() {

        const callbackQueue = RouteContext.#callbackQueue;

        const the_router = RouteContext.router;

        for (const callback of callbackQueue) {
            
            callback.bind(the_router).invoke();
        }

        RouteContext.#callbackQueue = [];
    }

    static getControllerClassByRoutingContext(symbol) {

        return RouteContext.context[symbol];
    }


    // this method will be called when there is no express's router object is initialized
    static #dispatchRouter() {

        const routingContext = RouteContext.currentContext;

        const currentSessionSymbol = RouteContext.currentSession;

        const registerMiddleware = function(_method, _path, _routeSession, _order = 'beforeController') {

            if (!_routeSession) return;
    
            const middlewareList = _routeSession[_order];
            
            if (!middlewareList) return;
            
            for (const middleware of middlewareList) {
    
                RouteContext.router[_method](_path, middleware);
            }
        }
        

        return function(method, path, _action) {

            const session = RouteContext.session(currentSessionSymbol);

            const {context, action} = session.meta;

            const matchContext = (routingContext == context);
            const matchAction = (_action == action);
            
            const middleWare = (matchContext && matchAction) ? registerMiddleware : () => {};


            const controllerClass = RouteContext.getControllerClassByRoutingContext(routingContext);

            //registerMiddleware(method, path, _session);
            middleWare(method, path, session);
            
            RouteContext.router[method](path, dispatchRequest(controllerClass, _action));

            //registerMiddleware(method, path, _session, 'afterController');
            middleWare(method, path, session, 'afterController');
        }
    }

    // static beforeDefine(_callback) {

    //     this.#hooks.beforeDefine.push(_callback);
    // }

    // static afterDefine(_callback) {

    //     this.#hooks.afterDefine.push(_callback);
    // }

    // static callHooks(_name) {

    //     const hooks = this.#hooks[_name];

    //     if (!hooks) return;

    //     for (const callback of hooks) {

    //         callback();
    //     }

    //     this.#hooks[_name] = [];
    // }

    static define(method, _path, _routingContext, _action, _sessionKey = undefined) {

        const callback = new PreInvokeFuncion(RouteContext.#dispatchRouter());

            //const session = (_sessionKey) ? this.session(_sessionKey) : undefined;
            
        callback.passArgs(method, _path, _action);
            
        RouteContext.#queue(callback);
            
        return;

    }

    
    /**
     * Queue an action for future invocation 
     * To invoke the actions, call RouteContext.dequeue() method
     * common use case:
     *      this method is used when there is no express object configured by init() method
     *      because sometime some specific controller classes is imported before calling RouteContext.init(express) 
     *      so the routing operation will not function properly and throw 'calling property of undefined' Error
     * 
     * @param {*} callback 
     */
    static #queue(callback) {

        RouteContext.#callbackQueue.push(callback);
    }

    static freeup() {

        if (!this.#isResolved) return;


    }

    static resolve() {
        if (!this.#routerObject) throw new Error('Router not found: you must call Route.init(express) before resolving routes')

        RouteContext.dequeue();

        this.#isResolved = true;

        this.freeup();

        return RouteContext.router;
    }

    static assignContext(symbol, _constructor) {

        RouteContext.#context[symbol] = _constructor;

    }/////////////////////////

    static defineContext(symbol) {

        //const symbol = Symbol(key);

        RouteContext.#currentRoutingContext = symbol;

        RouteContext.context[symbol] = 1;

        //Route.currentContext
    }////////////////////////

    static startSession(_context = undefined, _action = undefined) {

        const key = Date.now();
        const sessionSymbol = Symbol(key);

        this.#session[sessionSymbol] = {
            expires: false,
            beforeController: [],
            afterController: [],
            meta: {
                context: _context,
                action: _action
            }
        }

        return sessionSymbol;
    }

    static session(_symbol) {

        return this.#session[_symbol];
    }

    static assignSessionContext(_sessionSymbol, _contextSymbol) {

        if (!this.session(_sessionSymbol)) return false;

        if (!this.#context[_contextSymbol]) return false;

        this.session(_sessionSymbol).meta.context = _contextSymbol;
    }

    static assignSessionAction(_sessionSymbol, _action) {

        if (!_sessionSymbol) return false;

        if (!_action) return false;

        this.session(_sessionSymbol).meta.action = _action;
    }

    static switchSession (_symbol) {

        if (!this.session(_symbol)) throw new Error('RouteContext session error: switch to undefined routing session');

        this.#currentSession = _symbol;
    }

    static endSession(_symbol) {

        if (this.#session[_symbol]) {

            this.#session[_symbol].expires = true;

            return true;
        }

        return false;
    }

    static #registerMiddleware(_sessionSymbol, _order, ...args) {
        
        const session = this.#session[_sessionSymbol];

        if (!session) return;
        
        const currentMiddlewares = session[_order]; 

        this.#session[_sessionSymbol][_order] = undefined;
        //this.#currentSession = _sessionSymbol;
        //this.#session[_order] = [...current, ...args];
        this.#session[_sessionSymbol][_order] = [...currentMiddlewares, ...args];
    }

    static middlewareBeforeController(_sessionSymbol, _actionName, ...args) {

        return this.#registerMiddleware(_sessionSymbol, 'beforeController', ...args);
    }

    static middlewareAfterController(_sessionSymbol, _actionName, ...args) {

        return this.#registerMiddleware(_sessionSymbol, 'afterController', ...args);
    }
}

const Route = new Proxy(RouteContext, {
    additionMethod: {
        prop: {
            currentRoutePrefix: '',
        },
        prefix: function(_path) {
            //this.additionMethod.prop.currentRoutePrefix = _path;
            RouteContext.currentPrefix = _path;
            
            return (function(_targetContructor) {
                //this.additionMethod.prop.currentRoutePrefix = '';
                RouteContext.currentPrefix = '';
                return _targetContructor;
            });
        }
    },
    get: function (routeContext, _method) {

        if (this.additionMethod[_method]) {
            
            return this.additionMethod[_method].bind(this);
        }

        
        return function(path) {
            
            const routingContext = RouteContext.currentContext;

            const pathPrefix = RouteContext.currentPrefix;
            
            path = pathPrefix + path;
            
            return function(_controllerClass, _actionName, descriptor) {

                const currentSessionSymbol = RouteContext.currentSession;

                const decoratedResult = preprocessDescriptor(_controllerClass, _actionName, descriptor);

                descriptor.value = decoratedResult;

                if (decoratedResult.constructor.name == 'MethodDecorator') {

                    routeContext.define(_method, path, routingContext, _actionName, currentSessionSymbol);

                    return descriptor;
                }

                return descriptor;
            }
        }
    },
    set: () => {

        return false;
    }
})

const Endpoint = new Proxy(RouteContext, {
    httpMethods: {
        GET: 'get',
        HEAD: 'head',
        POST: 'post',
        PUT: 'put',
        DELETE: 'delete',
        CONNECT: 'connect',
        OPTIONS: 'options',
        TRACE: 'trace',
        PATCH: 'patch',
    },
    get: function(RouteClass, _method) {
        
        //if (!this.httpMethods.hasOwnProperty(_method)) throw new Error(`Endpoint decorator error: using invalid http method "${_method}"`);
        if (!this.httpMethods[_method]) throw new Error(`Endpoint decorator error: using invalid http method "${_method}"`);

        const correctName = this.httpMethods[_method];

        return Route[correctName];
    },
    set: () => {

        return false;
    }
});

// routingContext annotates the specified controller class is defining route
// if a controller class is not annotated with this annotation
// router will not map the route properly and will throw controller mapping error 
function routingContext() {

    const contextKey = Date.now();
    const symbol = Symbol(contextKey);

    RouteContext.defineContext(symbol);

    return function(_theConstructor) {    

        RouteContext.assignContext(symbol, _theConstructor);
        
        return _theConstructor;
    }
}

module.exports = {RouteContext, Endpoint, routingContext, Route};