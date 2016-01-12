# Pasta &#127837;
[![Build Status](https://travis-ci.org/albertodotcom/pasta.svg)](https://travis-ci.org/albertodotcom/pasta)
[![Coverage Status](https://coveralls.io/repos/albertodotcom/pasta/badge.svg?branch=master&service=github)](https://coveralls.io/github/albertodotcom/pasta?branch=master)

Pasta allows developers to scaffold applications, or files based on their templates (souces) &#127813;

## Status
The project is not ready yet. Some of the functionalities are still missing

- [ ] Use local configuartions files to drive
  - transformations
  - `src` and `dest` file paths
- [ ] Imporve logging
- [ ] Imporve error handling and test coverage

## Crazy eary adopters
If you feel really brave and you want to use it, type
`npm install -g pasta-templates`

then type `pasta` to see the options:
```
usage: pasta [options] [command]

commands:

  new <name> <srcFolder or gitRepo> [path] - create a scaffold project. Default path ./<name>
  create <template> <name> - create a set of files based on specific templates

  help - Display the available options

global options:

  -v, --verbose   show debug information
  -q, --quiet     only output critical errors
```

## Commands
### `pasta new`
This command creates a new project project based on a folder or, more likely, an existing git repo.

For instance `pasta new memory https://github.com/albertodotcom/react-template.git` will:

1. create a new project in the `./memory` folder by cloning the github repo;
2. apply a trasformation to every file content using **memory** as **appName**. See the [transformation section](#trasform);
3. execute `npm install && git init && git add --all && git commit -m "Create scaffold project"`

### `pasta create`
This command creates new files in the `src` folder.
For now your current repo needs to have the following structure
```
...
templates
└── create
    └── name
        └── files...
```
With this structure in place you can type `pasta create name Pesto` and `pasta` will:
1. copy all the files from `name/` folder to `./src/names/` (notice there is a *s*)
2. replace the files that have the `template` keyword with `Pesto`
3. transform the file content of every file using the process described at point 2 and 3 of the [transformation section](#trasform)

## Trasform
both `new` and `create` commands are meant to perform file trasformations.
There are 3 types of transformations:
1. **change file name**, using the `template` keyword in your filename.
For example assuming you have a `templates` folder like the following:
```
...
templates
└── create
    └── component
        └── template-test.js
        └── template.js
...
```
if you type `pasta create component Button`, you will get
```
...
src
└── components
    └── Button-test.js
    └── Button.js
templates
└── create
    └── component
        └── template-test.js
        └── template.js
...
```
2. **string iterpolation**, using *mustache* like syntax.
For example if you have a `package.json` file like the following
```json
{
  "name": "{{appName}}"
  ...
}
```
by running `pasta new hello http://yourRepo`, `package.json` will be converted to
```json
{
  "name": "hello"
}
```
3. **comment replacement**, using a comment in the line above the line you would like transform with this format
`||| nameInTheTemplate -> componentName`

For example if you have a react component in your `templates/create/component` folder like the following

```js
// ||| MyComponentName -> componentName
class MyComponentName extends React.Component {
  ...
}

// ||| MyComponentName -> componentName
export default MyComponentName;
```
when you run `pasta create component Button`, pasta will replace `MyComponentName` with `Button`
```js
class Button extends React.Component {
  ...
}

export default Button;
```

**Why the 3rd type of transformation?**
I would like to leave every template in a working state, so you can have linting on the file and test it.
