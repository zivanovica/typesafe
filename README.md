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
