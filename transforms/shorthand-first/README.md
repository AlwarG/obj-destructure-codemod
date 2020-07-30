# shorthand-first


## Usage

```
npx obj-destructure shorthand-first path/of/files/ or/some**/*glob.js

# or

yarn global add obj-destructure
obj-destructure shorthand-first path/of/files/ or/some**/*glob.js
```

## Input 

```
 let {
   apple: Apple,
   orange
 } = fruits
```
## Output

```
 let {
   orange,
   apple: Apple
 } = fruits
```