const Response = require('./responseResult.js');
const {preprocessDescriptor} = require('../decorator/utils.js');


function sendResponseBodyAndEndRequest(returnValue, _controllerObject, _theControllerAction, descriptor, type) {

    const res = _controllerObject.httpContext.response;

    res.send(returnValue)
    res.end();
}

function header(...arg) {

    return Response.setHeader(...arg);
}

function contentType(_value) {

    return Response.setHeader('Content-Type', _value);
}

function responseBody(_controllerClass, _action, descriptor) {

    const decoratorResult = preprocessDescriptor(_controllerClass, _action, descriptor);

    decoratorResult.payload['responseBody'] = 1;
    decoratorResult.on('afterResolve', sendResponseBodyAndEndRequest);
    //decoratedResult.transform(catchControllerActionReturnValue, 'responseBody');

    descriptor.value = decoratorResult;

    return descriptor;
}

module.exports = {header, contentType, responseBody};