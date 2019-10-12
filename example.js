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
        allowNull: false,
        type: Number,
        defaultValue: 44,
    },
    params: {
        type: Array,
        itemType: String,
        itemAllowNull: false,
    }
}, { unknown: false });

anyObject.min = 0;
anyObject.max = 2;
anyObject.params = ['ad', '2'];

console.log(anyObject.max);
