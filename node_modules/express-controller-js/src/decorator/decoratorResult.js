const PreInvokeFunction = require('../callback/preInvokeFunction.js');
const {EventEmitter} = require('node:events');

const DecoratorType =  {
    CLASS_DECORATOR: 0x1,
    PROPERTY_DECORATOR: 0x2,
}

class DecoratorResult extends EventEmitter{
    
    #type;
    kind;
    payload;
    _target; // this the class property or the specific class
    _context; // if target is the class's property, context is the object own the propety
    _actionQueue; // the addition thing we need to do before invoke resolving the DecoratorResult
    #_needContext;
    _targetDescriptor;
    //decoratorArgs;


    constructor(type, targetProp, action = undefined) {

        super();

        this._target = targetProp;
        this.#type = type;
        this._actionQueue = [];
        this.payload = {};

        this.#Init();    
    } 

    get needContext() {

        return this.#_needContext;
    }

    get type() {

        return this.#type;
    }

    #Init() {

        if (this.#type == DecoratorType.PROPERTY_DECORATOR) this.#_needContext = true;
        else this.#_needContext = false;

        this.#InitEvents();
    }

    #InitEvents() {
        this.on('beforeResolve', (context, _theTarget, descriptor, type) => {});
        this.on('afterResolve', (returnValue, context, _theTarget, descriptor, type) => {});
    }

    payload(...args) {

        for (const arg of args) {

            for (const prop in arg) {

                this.payload[prop] = arg[prop];
            }
        }

        //this.payload = args;
    }

    bind(object) {

        this._context = object;

        return this;
    }

    transform(_action, decoratorName) {

        this._actionQueue.push({
            action: _action,
            decoratorName: decoratorName
        });
    }

    resolve() {

        
        if (this.needContext && !this._context) throw new Error('DecoratorResult error: property decorator need context to be resolved');

        this.emit('beforeResolve', this._context, this._target, this._targetDescriptor, this.type);

        if (this.needContext) {
            
            this._target.bind(this._context);
        }

        for (const meta of this._actionQueue) {

            let {action, decoratorName} = meta;

            const payload = this.payload[decoratorName];

            const args = (payload.constructor.name == 'Array') ? payload : [payload];

            if (this.needContext) {

                action = action.bind(this._context);
            }

            if (action instanceof PreInvokeFunction) {

                //action.passArgs(this._target, ...this.payload[decoratorName]).invoke();
                action.passArgs(this._target, ...args).invoke();
            }
            else {

                //action(this._target, ...this.payload[decoratorName]);
                action(this._target, ...args);
            }
        }


        if (this._target instanceof PreInvokeFunction) {

            const result = this._target.invoke();
            this.emit('afterResolve', result, this._context, this._target, this._targetDescriptor, this.type);
            
            return result;
        }
        
        //this.emit('afterResolve', this._target, this._context, this._targetDescriptor, this.type);
        // if this._target is not instance of PreInvokeFunction 
        // it's mean the target of the decoratorResult is an class property
    }
}

class PropertyDecorator extends DecoratorResult {


    constructor(target, propName) {

        const obj = {
            target, propName
        }

        super(DecoratorType.PROPERTY_DECORATOR, obj);
    }

    resolve() {
        
        if (this.needContext && !this._context) throw new Error('PropertyDecorator error: property decorator need context to be resolved');
        
        for (const meta of this._actionQueue) {

            let {action, decoratorName} = meta;
            
            if (this.needContext) {

                action = action.bind(this._context);
            }

            //const {target, propName} = super._target;
 
            if (action instanceof PreInvokeFunction) {
                
                return action.passArgs(this._target, ...this.payload[decoratorName]).invoke();
            }
            else {
                
                return action(this._target, ...this.payload[decoratorName]);
            }
        }
    }
}

class MethodDecorator extends DecoratorResult {

   // #hooks;

    constructor(target, Prop) {

        super(DecoratorType.PROPERTY_DECORATOR, Prop);

        //this.#hooks = [];
        this.bind(target);
    }

    resolve() {

        const resolved_value = super.resolve();

        // for (const hook of this.#hooks) {

        //     const {callback, args} = hook;

        //     callback(resolved_value, ...args);
        // }
    }

    // whenFulfill(_callback,..._args) {

    //     this.#hooks.push({
    //         callback: _callback,
    //         args: _args,
    //     });
    // }
}

class ClassDecorator extends DecoratorResult {

    constructor(targetCLass) {

        super(DecoratorType.CLASS_DECORATOR, targetCLass);
    }
}


module.exports = {DecoratorResult, DecoratorType, MethodDecorator, PropertyDecorator, ClassDecorator};