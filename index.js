/**
 * Set type safety to object.
 *
 * @param {*} source Object to which type safety will be applied on.
 * @param {Object} definition Type safety definition.
 * @param {{unknown: boolean}} options Additional options.
 * @returns {*} source object.
 */
const makeTypeSafe = function (source, definition, {unknown = true} = {}) {
    let sourceObject = source;

    Object
        .entries(definition)
        .forEach(([field, fieldDefinition]) => {
            let fieldValue = undefined;

            const fieldType = (
                typeof fieldDefinition === 'object'
                    ? (fieldDefinition.type || null)
                    : fieldDefinition
            );

            const allowNull = (
                typeof fieldDefinition.allowNull === 'undefined'
                    ? true
                    : Boolean(fieldDefinition.allowNull)
            );

            const defaultValue = (
                typeof fieldDefinition.defaultValue === 'undefined'
                    ? undefined
                    : fieldDefinition.defaultValue
            );

            Object.defineProperty(sourceObject, field, {
                set(value) {
                    if (null === value && false === allowNull) {
                        throw new Error(`Property "${field}" is not nullable`);
                    }

                    if (
                        null !== fieldType && null !== value && undefined !== value && value.constructor !== fieldType
                    ) {
                        throw new TypeError(
                            `Invalid property type expected "${fieldType.name}" got "${value.constructor.name}"`
                        );
                    }

                    fieldValue = value;
                },
                get() {
                    return typeof fieldValue === 'undefined' && defaultValue || fieldValue;
                }
            });

            sourceObject[field] = sourceObject[field];
        });

    if (false === unknown) {
        sourceObject = new Proxy(sourceObject, {
            set: (target, property, value) => {
                if (typeof definition[property] === 'undefined') {
                    throw new Error(`Property "${property}" not allowed.`);
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
