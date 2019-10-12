/**
 * Set type safety to object.
 *
 * @param {*} source Object to which type safety will be applied on.
 * @param {Object} definition Type safety definition.
 * @returns {*} source object.
 */
const makeTypeSafe = function (source, definition) {
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

            Object.defineProperty(source, field, {
                set(value) {
                    if (value === null && false === allowNull) {
                        throw new Error(`Property "${field}" is not nullable`);
                    }

                    if (fieldType !== null && value !== null && value.constructor !== fieldType) {
                        throw new TypeError(
                            `Invalid property type expected "${fieldType.name}" got "${value.constructor.name}"`
                        );
                    }

                    fieldValue = value;
                },
                get() {
                    return fieldValue;
                }
            });

            typeof source[field] !== 'undefined' && (source[field] = source[field]);
        });

    return source;
};

class TypeSafe {
    constructor(definition) {
        if (new.target === TypeSafe) {
            throw new TypeError(`TypeSafe is abstract class, therefor it cannot be instantiated.`);
        }

        makeTypeSafe(this, definition);
    }
}

module.exports = {
    makeTypeSafe,
    TypeSafe,
};
