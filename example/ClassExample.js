const { MakeClassTypeSafe } = require('../');

const UserBasicInterface = {
    name: {
        type: String,
        defaultValue: 'Guest'
    },
    email: {
        type: String,
        defaultValue: 'none',
        allowNull: false
    },
    age: {
        type: Number,
        defaultValue: NaN,
    },
    getDetails: {
        type: Function,
        parameters: [String],
        exact: true,
        returns: {
            type: Array,
            allowNull: false
        }
    }
};

const UserContactInterface = {
    name: String,
    address: String,
    phone: {
        type: String,
        allowNull: false,
        defaultValue: '00-00000',
    }
};

class User {
    constructor(name, email, age) {
        this.name = name && name;
        this.email = email && email;
        this.age = age && age;
    }

    getDetails(message) {
        return [
            message,
            this.name,
            this.email,
            this.age
        ];
    }
}

module.exports = MakeClassTypeSafe(
    User,
    [
        UserBasicInterface,
        UserContactInterface,
    ],
    { unknown: false }
);
