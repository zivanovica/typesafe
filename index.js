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
const validateType = ({ value, fieldType, allowNull, error }) => {
    if (
        (
            (null === value && false === allowNull) ||
            (null !== fieldType && null !== value && undefined !== value && value.constructor !== fieldType)
        ) && typeof fieldType !== 'undefined'
    ) {
        throw new TypeError(error);
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
        throw new TypeError(`Property "${ property }" does not exist.`);
    }
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
                    throw new Error(
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
                fieldType,
                error: `Invalid "${ property }" property type, expected "${ fieldTypeName }" got "${ valueTypeName }"`,
            });

            if (value instanceof Array && null !== fieldItemType) {
                value.forEach((item, index) => {
                    const itemTypeName = item && item.constructor.name || 'null';

                    validateType({
                        fieldType: fieldItemType,
                        allowNull: fieldItemAllowNull,
                        value: item,
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
            const {
                type = null, allowNull = true, defaultValue = undefined
            } = typeof fieldDefinition === 'object' ? fieldDefinition : { type: fieldDefinition };

            let fieldType = type;
            let fieldItemType = null;
            let fieldItemAllowNull = true;

            if (type instanceof Array) {
                fieldType = Array;

                [ { type: fieldItemType = null, allowNull: fieldItemAllowNull = true } ] = type;
            }

            const { name: fieldTypeName = 'null' } = null === fieldType ? {} : fieldType;
            const { name: fieldItemTypeName = 'null' } = null === fieldItemType ? {} : fieldItemType;

            properties[field] = {
                fieldType, fieldItemType, fieldItemAllowNull, allowNull, defaultValue, fieldTypeName, fieldItemTypeName
            };

            proxy[field] = typeof source[field] !== 'undefined' ? source[field] : defaultValue;
        });

    return proxy;
};

/**
 * Apply type safety on class.
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
    MakeClassTypeSafe,
};
