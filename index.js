/**
 * Perform type validation upon provided value.
 *
 * @param {*} value Value that is being asserted.
 * @param {*} fieldType Expected type.
 * @param {boolean} allowNull Flag that determines whether or not to allow null.
 * @param {string} error Error message.
 *
 * @throws {TypeError} Validation error.
 */
const validateType = ({value, fieldType, allowNull, error}) => {
    if (
        (null === value && false === allowNull) ||
        (null !== fieldType && null !== value && undefined !== value && value.constructor !== fieldType)
    ) {
        throw new TypeError(error);
    }
};

/**
 *  Validate is property available in source object, throw error if not.
 *
 * @param {object} definition Property definition.
 * @param {string} property Name of property.
 * @param {boolean} unknown Flag that determines are unknown properties allowed.
 *
 * @throws TypeError
 */
const validatePropertyExistence = ({definition, property} = {}) => {
    if (typeof definition[property] === 'undefined') {
        throw new TypeError(`Property "${property}" does not exist.`);
    }
};

/**
 * Set type safety to object.
 *
 * @param {Object} source Object to which type safety will be applied on.
 * @param {Object} definition Type safety definition.
 * @param {Object} options Additional options.
 * @param {boolean} options.unknown Flag that determines whether or not to allow parameters that are not defined in definition.
 * @returns {*} source object.
 *
 * @throws {TypeError} Validation error.
 */
const makeTypeSafe = function (source, {...definition} = {}, {...options} = {}) {
    const {unknown = true} = options;

    let sourceObject = source;

    Object
        .entries(definition)
        .forEach(([property, fieldDefinition]) => {
            const {
                type = null, allowNull = true, defaultValue = undefined
            } = typeof fieldDefinition === 'object' ? fieldDefinition : {type: fieldDefinition};

            let fieldType = type;
            let fieldItemType = null;
            let fieldItemAllowNull = true;

            if (type instanceof Array) {
                fieldType = Array;

                [{type: fieldItemType = null, allowNull: fieldItemAllowNull = true}] = type;
            }

            const {name: fieldTypeName = 'null'} = null === fieldType ? {} : fieldType;
            const {name: fieldItemTypeName = 'null'} = null === fieldItemType ? {} : fieldItemType;

            let propertyValue = undefined;

            Object.defineProperty(source, property, {
                configurable: false,
                enumerable: true,
                set: (value) => {
                    const valueTypeName = value && value.constructor.name || 'null';

                    validateType({
                        value,
                        allowNull,
                        fieldType,
                        error: `Invalid "${property}" property type, expected "${fieldTypeName}" got "${valueTypeName}"`,
                    });

                    if (value instanceof Array && null !== fieldItemType) {
                        value.forEach((item, index) => {
                            const itemTypeName = item && item.constructor.name || 'null';

                            validateType({
                                fieldType: fieldItemType,
                                allowNull: fieldItemAllowNull,
                                value: item,
                                error: `Invalid "${property}" property item[${index}] type, expected "${fieldItemTypeName}" got "${itemTypeName}"`
                            });
                        });
                    }

                    propertyValue = value;
                },
                get: () => {
                    return typeof propertyValue === 'undefined' ? defaultValue : propertyValue;
                }
            });

            sourceObject[property] = (
                typeof sourceObject[property] !== 'undefined' ? sourceObject[property] : defaultValue
            );
        });

    if (false === unknown) {
        sourceObject = new Proxy(sourceObject, {
            get: (target, property) => {
                validatePropertyExistence({definition, property});

                return target[property];
            },
            set: (target, property, value) => {
                validatePropertyExistence({definition, property});

                target[property] = value;
            },
        });
    }

    return sourceObject;
};

/**
 * Apply type safety on class.
 * @param {function} actualClass Class constructor.
 * @param {object} definition Property definition.
 * @param {object} options Additional options.
 * @returns {function(...[*]): *} Constructor.
 * @constructor
 */
const TypeSafeExtend = (actualClass, definition, options = {}) => {
    return function (...arguments) {
        const actualClassBind = actualClass.bind(null, ...arguments);

        return makeTypeSafe(new actualClassBind(), definition, options);
    }
};

module.exports = {
    makeTypeSafe,
    TypeSafeExtend,
};
