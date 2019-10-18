const { makeTypeSafe, makeFunctionTypeSafe } = require('../');

const User = require('./ClassExample');
const user = new User();

console.log(user);

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
}, { unknown: false });

anyObject.min = 0;
anyObject.max = 2;
anyObject.params = [ 'ad', '2' ];

console.log(anyObject.params, anyObject.max);

const getString = makeFunctionTypeSafe((name, email, age, data) => {
        return `Name: ${ name }\nEmail: ${ email }\nAge: ${ age }\nData: ` + JSON.stringify(data);
    },
    [
        String, String, { type: Number, allowNull: false }, Array({ type: String, allowNull: false, })
    ],
    { returns: { type: String, allowNull: false }, exact: true, name: 'getString' }
);

console.log(getString('John Mayer', 'john.mayer@mayerscorp.com', 67, [ 'one', 'two', 'null', '1' ]));
