class TypeSafeError extends Error {
}

class TypeSafeInvalidTypeError extends TypeSafeError {
}

class TypeSafeInvalidPropertyError extends TypeSafeError {
}

class TypeSafePropertyCollisionError extends TypeSafeError {

}

class TypeSafeInvalidFunctionName extends TypeSafeError {

}

class TypeSafeFunctionArgumentsMismatch extends TypeSafeError {
}


module.exports = {
    TypeSafeError,
    TypeSafeInvalidTypeError,
    TypeSafeInvalidPropertyError,
    TypeSafePropertyCollisionError,
    TypeSafeInvalidFunctionName,
    TypeSafeFunctionArgumentsMismatch,
};
