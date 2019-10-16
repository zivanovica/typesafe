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

    const properties = {};

    Object
        .entries(definition)
        .forEach(([field, fieldDefinition]) => {
            const {
                type: fieldType = null,
                itemType: fieldItemType = null,
                itemAllowNull: fieldItemAllowNull = true,
                allowNull = true,
                defaultValue = undefined
            } = typeof fieldDefinition === 'object' ? fieldDefinition : {type: fieldDefinition};

            const {name: fieldTypeName = 'null'} = null === fieldType ? {} : fieldType;
            const {name: fieldItemTypeName = 'null'} = null === fieldItemType ? {} : fieldItemType;

            properties[field] = {
                fieldType, fieldItemType, fieldItemAllowNull, allowNull, defaultValue, fieldTypeName, fieldItemTypeName
            };
        });

    /**
     *  Validate is property available in source object, throw error if not.
     *
     * @param {string} property Name of property.
     * @param {boolean} unknown Flag that determines are unknown properties allowed.
     *
     * @throws TypeError
     */
    const validatePropertyExistence = ({property, unknown = true} = {}) => {
        if (false === unknown && typeof properties[property] === 'undefined') {
            throw new TypeError(`Property "${property}" does not exist.`);
        }
    };

    return new Proxy(source, {
        set: (target, property, value) => {
            validatePropertyExistence({ property, unknown });

            const {
                fieldType = null, fieldItemType = null, fieldItemAllowNull = true,
                allowNull = null, defaultValue = undefined, fieldTypeName = 'null', fieldItemTypeName = 'null'
            } = properties[property] || {};

            const valueTypeName = value && value.constructor.name || 'null';

            validateType({
                value,
                allowNull,
                fieldType,
                error: `Invalid "${property}" property type, expected "${fieldTypeName}" got "${valueTypeName}"`,
            });

            if (value instanceof Array && null !== fieldItemType) {
                value.forEach((item) => {
                    const itemTypeName = item && item.constructor.name || 'null';

                    validateType({
                        fieldType: fieldItemType,
                        allowNull: fieldItemAllowNull,
                        value: item,
                        error: `Invalid "${property}" property item type, expected "${fieldItemTypeName}" got "${itemTypeName}"`
                    });
                });
            }

            target[property] = value;
        },
        get: (target, property) => {
            validatePropertyExistence({ property, unknown });

            return typeof target[property] === 'undefined'
                ? (properties[property] && properties[property].defaultValue)
                : target[property];
        }
    });
};

class TypeSafe {
    constructor(definition) {
        if (TypeSafe === new.target) {
            throw new TypeError(`TypeSafe is abstract class, therefor it cannot be instantiated.`);
        }

        makeTypeSafe(this, definition);
    }
}

module.exports = {
    makeTypeSafe,
    TypeSafe,
};
