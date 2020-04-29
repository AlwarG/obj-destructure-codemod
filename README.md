# obj-destructure


A collection of codemod's for obj-destructure.

## Usage

To run a specific codemod from this project, you would run the following:

```
npx obj-destructure <TRANSFORM NAME> path/of/files/ or/some**/*glob.js

# or

yarn global add obj-destructure
obj-destructure <TRANSFORM NAME> path/of/files/ or/some**/*glob.js
```

## Transforms

<!--TRANSFORMS_START-->
```
let prop = obj1.prop
let property = obj2.prop;
```

into this

```
let {
    prop
  } = obj1;
let {
    prop: property
  } = obj2;
```
<!--TRANSFORMS_END-->

## Contributing

### Installation

* clone the repo
* change into the repo directory
* `yarn`

### Running tests

* `yarn test`

### Update Documentation

* `yarn update-docs`