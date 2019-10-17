const {MakeClassTypeSafe} = require('../');

class User {
    getDetails() {
        return [
            this.name,
            this.email,
            this.age
        ];
    }
}

module.exports = MakeClassTypeSafe(User, {
    name: {
        type: String,
        defaultValue: 'John'
    },
    email: {
        type: String,
        defaultValue: 'none',
        allowNull: false
    },
    age: {
        type: Number,
        defaultValue: 18
    },
}, {unknown: false});
