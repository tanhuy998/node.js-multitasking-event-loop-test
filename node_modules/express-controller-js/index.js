const PreInvokeFunction = require('./src/callback/preInvokeFunction.js');
const controller = require('./src/controller/baseController.js')
const decorator = require('./src/decorator/decoratorResult.js');
const http = require('./src/http/httpRouting.js');
const middleware = require('./src/middleware/middleware.js');
const response = require('./src/response/responseResult.js');
const baseController = require('./src/controller/baseController.js');
const requestDispatcher = require('./src/requestDispatcher.js');
const responseDecorator = require('./src/response/decorator.js')


module.exports = {
    PreInvokeFunction , ...controller, ...decorator, ...http, ...middleware, ...response, ...baseController, ...requestDispatcher, ...responseDecorator
};