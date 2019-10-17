const { TypeSafeExtend } = require('../');

class User {

}

module.exports = TypeSafeExtend(User, {
    name: String,
    email: {
        type: String,
        allowNull: false
    },
    age: {
        type: Number,
        defaultValue: 18
    },
}, { unknown: false });
