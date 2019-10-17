const { makeTypeSafe } = require('../');
const User = require('./ClassExample');

const user = new User('Aleksandar', 'coapsyfactor@gmail.com', 25);

console.log(user.getDetails());

const anyObject = makeTypeSafe({}, {
    min: Number,
    max: {
        allowNull: false,
        type: Number,
        defaultValue: 44,
    },
    params: {
        type: Array({
            type: String,
            allowNull: false,
        }),
    },
}, {unknown: false});

anyObject.min = 0;
anyObject.max = 2;
anyObject.params = ['ad', '2'];

console.log(anyObject.params, anyObject.max);
