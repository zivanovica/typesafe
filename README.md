# TypeSafe
Wrapper that allows javascript classes and objects to have strict type properties.

Check `example.js` for usage.

NOTE: Additional features are in development.

Usage
---

Usage with standard objects.
```javascript
const { makeTypeSafe } = require('@zveket3/typesafe');

const PropertyDefinition = {
    name: String,
    nicknames: {
        type: Array({
            type: String
            allowNull: false,
        }),
    },
    age: {
        type: Number,
        defaultValue: 18
    },
    address: {
        type: String,
        allowNull: false
    },
    attributes: {}
};

const typedObject = makeTypeSafe({}, PropertyDefinition);

typedObject.name = 'My Name'; // OK
typedObject.age = '25'; // Will cause error, expected Number got String
typedObject.nicknames = [ 'John', null ]; // Will cause error, expected item type String got Null
```

Usage with ES6 classes
```javascript
const { MakeClassTypeSafe } = require('@zveket3/typesafe');

const PropertyDefinition = {
    name: String,
    nicknames: {
        type: Array({
            type: String
            allowNull: false,
        }),
    },
    age: {
        type: Number,
        defaultValue: 18
    },
    attributes: {}
};

const AdditionalDefinition = {
    address: {
        type: String,
        allowNull: false
    },
};

class User {}

// Here we provide multiple definitions that will be merged as one
module.exports = MakeClassTypeSafe(User, [PropertyDefinition, AdditionalDefinition], { unknown: false });
```

Property definition description
- type: Property type
- allowNull: Flag that determines whether or not nulling of property is allowed
- defaultValue: Value returned when typeof property is undefined

For ``Array`` property type
- type: Array item type.
- allowNull: Flag that determines whether or not can item in array be null.

Options:
- unknown: Flag that determines whether or not can object hold properties that are not defined.

Type Safe Functions
---
There is also way to define type safe function.
Type safe functions take care of arguments passed to function as well as return value from it.

Usage
```javascript
const { makeFunctionTypeSafe } = require('@zveket3/typesafe');

const getString = makeFunctionTypeSafe((name, email, age, data) => {
        return `Name: ${ name }\nEmail: ${ email }\nAge: ${ age }\nData: ` + JSON.stringify(data);
    },
    [
        String, String, { type: Number, allowNull: false }, Array({ type: String, allowNull: false, })
    ],
    { returns: { type: String, allowNull: false }, exact: true, name: 'getString' }
);

console.log(getString('John Mayer', 'john.mayer@mayerscorp.com', 67, [ 'one', 'two', 'null', '1' ]));
```
Property definition description
- type: Parameter type
- allowNull: Flag that determines whether or not nulling of parameter is allowed
- defaultValue: Value returned when typeof parameter is undefined

For ``Array`` property type
- type: Array item type.
- allowNull: Flag that determines whether or not can item in array be null.

Options:
- exact: Flag that determines whether or not to expect exact count of arguments
- name: Function name, default: anonymous
- returns: Defines return type as well as if null is allowed as result, can be simplified ``returns: Number``
