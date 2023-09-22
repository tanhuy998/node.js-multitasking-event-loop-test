const {preprocessDescriptor} = require('../decorator/utils.js');
// const PreInvokeFuncion = require('../callback/preInvokeFunction.js');
// const { DecoratorResult } = require('../decorator/decoratorResult.js');

// function sendResponseBodyAndEndRequest(returnValue, _controllerObject, _theControllerAction, descriptor, type) {

//     const res = _controllerObject.httpContext.response;

//     res.end(returnValue);
// }

// function responseBody(_controllerClass, _action, descriptor) {

//     const decoratorResult = preprocessDescriptor(_controllerClass, _action, descriptor);

//     decoratorResult.payload['responseBody'] = 1;
//     decoratorResult.on('afterResolve', sendResponseBodyAndEndRequest);
//     //decoratedResult.transform(catchControllerActionReturnValue, 'responseBody');

//     descriptor.value = decoratorResult;

//     return descriptor;
// }


const obj = {};

function invokeResponse(_method, ...payload) {

    // context of this here is Controller object
    const [resAction, args] = payload;

    const res = this.httpContext.response;
    
    res[resAction](...args);
}

const Response = new Proxy(obj, {
    get: (_target, _methodName) => {

        return function(...args) {

            return function (_controllerClass, _action, descriptor) {
                
                const decoratedResult = preprocessDescriptor(_controllerClass, _action, descriptor);

                //const callback = new PreInvokeFuncion(invokeResponse, ...args);
                decoratedResult.payload['invokeResponse'] = [_methodName, args];

                decoratedResult.transform(invokeResponse, 'invokeResponse');

                descriptor.value = decoratedResult;

                return descriptor;
            } 
        }
    },
    set: () => false
}) 

// function contentType(_value) {

//     return Response.setHeader('Content-Type', _value);
// }


module.exports = Response;