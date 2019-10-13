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

    let sourceObject = source;

    Object
        .entries(definition)
        .forEach(([field, fieldDefinition]) => {
            let fieldValue = undefined;

            const {
                type: fieldType = null,
                itemType: fieldItemType = null,
                itemAllowNull: fieldItemAllowNull = true,
                allowNull = true,
                defaultValue = undefined
            } = typeof fieldDefinition === 'object' ? fieldDefinition : {type: fieldDefinition};

            const {name: fieldTypeName = 'null'} = null === fieldType ? {} : fieldType;
            const {name: fieldItemTypeName = 'null'} = null === fieldItemType ? {} : fieldItemType;

            Object.defineProperty(sourceObject, field, {
                set(value) {
                    const valueTypeName = value && value.constructor.name || 'null';

                    validateType({
                        value,
                        allowNull,
                        fieldType,
                        error: `Invalid "${field}" property type, expected "${fieldTypeName}" got "${valueTypeName}"`,
                    });

                    if (value instanceof Array && null !== fieldItemType) {
                        value.forEach((item) => {
                            const itemTypeName = item && item.constructor.name || 'null';

                            validateType({
                                field,
                                fieldType: fieldItemType,
                                allowNull: fieldItemAllowNull,
                                value: item,
                                error: `Invalid "${field}" property item type, expected "${fieldItemTypeName}" got "${itemTypeName}"`
                            });
                        });
                    }

                    fieldValue = value;
                },
                get() {
                    return typeof fieldValue === 'undefined' && defaultValue || fieldValue;
                },
            });

            sourceObject[field] = sourceObject[field];
        });

    if (false === unknown) {
        sourceObject = new Proxy(sourceObject, {
            set: (target, property, value) => {
                if (typeof definition[property] === 'undefined') {
                    throw new TypeError(`Property "${property}" not allowed.`);
                }

                target[property] = value;
            }
        });
    }

    return sourceObject;
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
