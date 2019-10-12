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
    max: Number,
});

anyObject.min = 0;
anyObject.max = 2;
