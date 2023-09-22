const {DecoratorType, DecoratorResult, MethodDecorator, PropertyDecorator, ClassDecorator} = require('./decoratorResult.js');
const PreInvokeFunction = require('../callback/preInvokeFunction.js')
      

const ControllerContextFunctions = {
    transformProperty
}

function transformProperty(decoratorResultTarget, ...decoratorResultPayload) {
    //console.log('transform', decoratorResultTarget)
    // this context of the function is the controller object
    const reqParams = this.httpContext.request.params || {};

    const {propName} = decoratorResultTarget;
    
    const new_value = {};

    const length = decoratorResultPayload.length;

    if (length == 0) {

        this[propName] = reqParams;

        return;
    }

    if (length == 1) {

        const param_name = decoratorResultPayload[0];

        this[propName] = reqParams[param_name];

        return;
    }

    for (const param_name of decoratorResultPayload) {

        new_value[param_name] = reqParams[param_name]
    }

    this[propName] = new_value;
};

function preprocessDescriptor(_targetObject, propName, descriptor, decoratorType = DecoratorType.PROPERTY_DECORATOR) {

    if (decoratorType = DecoratorType.PROPERTY_DECORATOR) {

        const the_target_prop = descriptor.value;

        let decoratorResult;
        let the_transformed_prop;
        

        if (!(the_target_prop instanceof DecoratorResult)) {

            if (typeof the_target_prop == 'function') {

                the_transformed_prop = new PreInvokeFunction(the_target_prop);
                
                const decorator = new MethodDecorator(_targetObject, the_transformed_prop).bind(_targetObject);
                decorator._targetDescriptor = descriptor;
                //the_prop_is_function = true;
                return decorator;
            }
            else {
                
                the_transformed_prop = the_target_prop;

                const decorator = new PropertyDecorator(_targetObject, propName).bind(_targetObject);
                decorator._targetDescriptor = descriptor;  

                return decorator;
            }
            
        }
        else {

            decoratorResult = the_target_prop.bind(_targetObject);
            decoratorResult._targetDescriptor = descriptor;

            return decoratorResult;
        }
    }
}

module.exports = {
    preprocessDescriptor, transformProperty, ControllerContextFunctions
}