const {
    TypeSafeInvalidTypeError,
    TypeSafeInvalidPropertyError,
    TypeSafePropertyCollisionError,
    TypeSafeFunctionArgumentsMismatch,
    TypeSafeInvalidFunctionName,
} = require('./errors');

/**
 * Perform type validation upon provided value.
 *
 * @param {*} value Value that is being asserted.
 * @param {*} type Expected type.
 * @param {boolean} allowNull Flag that determines whether or not to allow null.
 * @param {string} error Error message.
 *
 * @throws {TypeError} Validation error.
 */
const validateType = ({ value, type, allowNull, error }) => {
    if (
        (
            (null === value && false === allowNull) ||
            (null !== type && null !== value && undefined !== value && value.constructor !== type)
        ) && typeof type !== 'undefined'
    ) {
        throw new TypeSafeInvalidTypeError(error);
    }
};

/**
 *  Validate is property available in source object, throw error if not.
 *
 * @param {object} properties Defined object properties.
 * @param {string} property Name of property.
 * @param {boolean} unknown Flag that determines are unknown properties allowed.
 *
 * @throws TypeError
 */
const validatePropertyExistence = ({ properties, property, unknown = true } = {}) => {
    if (false === unknown && typeof properties[property] === 'undefined') {
        throw new TypeSafeInvalidPropertyError(`Property "${ property }" does not exist.`);
    }
};

/**
 * Generate valid property definition.
 *
 * @param {object} definition Base definition schema
 * @returns {{fieldItemAllowNull: *, fieldItemTypeName: *, fieldTypeName: *, defaultValue: *, fieldItemType: *, allowNull: *, fieldType: *}}
 */
const makePropertyDefinition = (definition) => {
    const {
        type = null, allowNull = true, defaultValue = undefined
    } = (
        false === definition instanceof Array && typeof definition === 'object' ? definition : { type: definition }
    );

    let fieldType = type;
    let fieldItemType = null;
    let fieldItemAllowNull = true;

    if (type instanceof Array) {
        fieldType = Array;

        [ { type: fieldItemType = null, allowNull: fieldItemAllowNull = true } ] = type.length && type || [ {} ];
    }

    const { name: fieldTypeName = 'null' } = null === fieldType ? {} : fieldType;
    const { name: fieldItemTypeName = 'null' } = null === fieldItemType ? {} : fieldItemType;

    return {
        fieldType, fieldItemType, fieldItemAllowNull, allowNull, defaultValue, fieldTypeName, fieldItemTypeName
    };
};

/**
 * Create definition object generated from provided interfaces.
 *
 * @param {Array} interfaces Interfaces.
 *
 * @returns {Object} Definition schema.
 */
const makeDefinition = (interfaces) => {
    const definition = {};

    interfaces.forEach((interfaceDefinition) => {
        Object
            .entries(interfaceDefinition)
            .forEach(([ property, value ]) => {
                value = typeof value === 'object' ? value : { type: value };

                if (typeof definition[property] !== 'undefined' && definition[property].type !== value.type) {
                    throw new TypeSafePropertyCollisionError(
                        `Property "${ property }" collision, defined in multiple interfaces with different type.`
                    );
                }

                definition[property] = { ...definition[property], ...value };
            });
    });

    return definition;
};

/**
 * Set type safety to object.
 *
 * @param {Object} source Object to which type safety will be applied on.
 * @param {Array|Object} interfaces Interfaces source object is implementing.
 * @param {Object} options Additional options.
 * @param {boolean} options.unknown Flag that determines whether or not to allow parameters that are not defined in definition.
 * @returns {*} source object.
 *
 * @throws {TypeError} Validation error.
 */
const makeTypeSafe = function (source, interfaces, { ...options } = {}) {
    if (false === interfaces instanceof Array) {
        interfaces = [ interfaces ];
    }

    const { unknown = true } = options;

    const properties = {};

    const proxy = new Proxy(source, {
        set: (target, property, value) => {
            validatePropertyExistence({ properties, property, unknown });

            const {
                fieldType, fieldItemType, fieldItemAllowNull, allowNull, defaultValue, fieldTypeName, fieldItemTypeName
            } = properties[property] || {};

            const valueTypeName = value && value.constructor.name || 'null';

            validateType({
                value,
                allowNull,
                type: fieldType,
                error: `Invalid "${ property }" property type, expected "${ fieldTypeName }" got "${ valueTypeName }"`,
            });

            if (value instanceof Array && null !== fieldItemType) {
                value.forEach((item, index) => {
                    const itemTypeName = item && item.constructor.name || 'null';

                    validateType({
                        type: fieldItemType,
                        value: item,
                        allowNull: fieldItemAllowNull,
                        error: `Invalid "${ property }" property item[${ index }] type, expected "${ fieldItemTypeName }" got "${ itemTypeName }"`
                    });
                });
            }

            target[property] = value;
        },
        get: (target, property) => {
            if (typeof target[property] !== 'function') {
                validatePropertyExistence({ properties, property, unknown });
            }

            return typeof target[property] === 'undefined'
                ? (properties[property] && properties[property].defaultValue)
                : target[property];
        }
    });

    Object
        .entries(makeDefinition(interfaces))
        .forEach(([ field, fieldDefinition ]) => {
            properties[field] = makePropertyDefinition(fieldDefinition);

            proxy[field] = typeof source[field] !== 'undefined' ? source[field] : properties[field].defaultValue;
        });

    return proxy;
};

/**
 * Provide function that has parameters typechecking.
 *
 * @param {function} callback Function callback.
 * @param {Array} parameters Parameters types definition.
 * @param {object} options Additional options.
 * @returns {function}
 */
const makeFunctionTypeSafe = (callback, parameters, options = {}) => {
    const definition = parameters
        .map((parameter) => (makePropertyDefinition(parameter)));

    const { exact = true, name = 'anonymous', returns = {} } = options;

    if (typeof name !== 'string' || 0 === name.length) {
        throw new TypeSafeInvalidFunctionName(`Invalid function name provided`);
    }

    const {
        fieldType: returnType, fieldTypeName: returnTypeName, allowNull: returnAllowNull
    } = makePropertyDefinition(returns);

    return (function (...arguments) {
        if (exact && arguments.length !== definition.length) {
            throw new TypeSafeFunctionArgumentsMismatch(
                `Invalid arguments length provided to "${ name }", expected ${ definition.length } got ${ arguments.length }`
            );
        }

        const result = callback.apply(null, definition
            .map((data, index) => {
                const {
                    fieldType: type,
                    fieldTypeName: typeName,
                    fieldItemType,
                    fieldItemTypeName,
                    fieldItemAllowNull,
                    allowNull,
                    defaultValue
                } = data;

                const value = typeof arguments[index] === 'undefined' ? defaultValue : arguments[index];
                const valueTypeName = value && value.constructor.name || 'null';

                validateType({
                    value,
                    type,
                    allowNull,
                    error: (
                        `Invalid argument[${ index }] provided to "${ name }", expected "${ typeName }" got "${ valueTypeName }"`
                    )
                });

                if (value instanceof Array && null !== fieldItemType) {
                    value.forEach((item, itemIndex) => {
                        const itemTypeName = item && item.constructor.name || 'null';

                        validateType({
                            type: fieldItemType,
                            value: item,
                            allowNull: fieldItemAllowNull,
                            error: `Invalid argument[${ index }] item[${ itemIndex }] provided to "${ name }", expected "${ fieldItemTypeName }" got "${ itemTypeName }"`,
                        });
                    });
                }

                return value;
            }));

        const resultTypeName = result && result.constructor.name || 'null';

        validateType({
            value: result,
            type: returnType,
            allowNull: returnAllowNull,
            error: `Invalid "${ name }" return type, expected "${ returnTypeName }" got "${ resultTypeName }"`
        });

        return result;
    }).bind(callback);
};

/**
 * Apply type safety on class.
 *
 * @param {function} actualClass Class constructor.
 * @param {Array|object} interfaces Interfaces actualClass is implementing.
 * @param {object} options Additional options.
 * @returns {function(...[*]): *} Constructor.
 * @constructor
 */
const MakeClassTypeSafe = (actualClass, interfaces, options = {}) => {
    return function (...arguments) {
        const actualClassBind = actualClass.bind(null, ...arguments);

        return makeTypeSafe(new actualClassBind(), interfaces, options);
    }
};

module.exports = {
    makeTypeSafe,
    makeFunctionTypeSafe,
    MakeClassTypeSafe,
};
