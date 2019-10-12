const { TypeSafe, makeTypeSafe } = require('./');

class User extends TypeSafe {
    constructor() {
        super({
            name: String,
            email: {
                type: String,
                allowNull: false,
            },
            age: Number,
        });
    }
}

const user = new User();

user.name = null;
user.email = 'asd';

const anyObject = makeTypeSafe({}, {
    min: Number,
    max: {
        type: Number,
        defaultValue: 44,
    },
}, { unknown: false });

anyObject.min = 0;

console.log(anyObject.max);
