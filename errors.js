class TypeSafeError extends Error {
}

class TypeSafeInvalidTypeError extends TypeSafeError {
}

class TypeSafeInvalidPropertyError extends TypeSafeError {
}

class TypeSafePropertyCollisionError extends TypeSafeError {

}

module.exports = {
    TypeSafeError,
    TypeSafeInvalidTypeError,
    TypeSafeInvalidPropertyError,
    TypeSafePropertyCollisionError,
};
