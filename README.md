# obj-destructure-codemod


A collection of codemod's for obj-destructure.

## Usage

To run a specific codemod from this project, you would run the following:

```
npx obj-destructure-codemod <TRANSFORM NAME> path/of/files/ or/some**/*glob.js

# or

yarn global add obj-destructure-codemod
obj-destructure-codemod <TRANSFORM NAME> path/of/files/ or/some**/*glob.js
```
# obj-destructure
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

# function-arg-obj-destructure
## Transforms 

```
function getProp(obj) {
  return obj.prop;
}
```
into this 

```
function getProp({ prop }) {
  return prop;
}
```


**Note:**

```
function printProps(obj) {
  console.log(obj.prop1, obj.prop2);
}
```
The above function will not be transformed. Because we have allowable properties length as `1`.
Incase you want to increase this length change [here](https://github.com/AlwarG/obj-destructure-codemod/blob/master/transforms/function-arg-obj-destructure/index.js#L6)

## Contributing

### Installation

* clone the repo
* change into the repo directory
* `yarn`

### Running tests

* `yarn test`

### Update Documentation

* `yarn update-docs`