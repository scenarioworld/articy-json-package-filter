# articy-json-package-filter

Webpack loader which strips packages out of [Articy](http://articy.com/) JSON files.

## Install

```
npm install --save-dev articy-json-package-filter
yarn add -D articy-json-package-filter
```

## Usage

Add a rule to your webpack config.

```js
module.exports = { 
  module: { 
    rules: [
      { 
          test: /\xlsx$/, 
          use: { 
              loader: "articy-xlsx-loader",
              options: { 
                  include: [/^common\./, /episode1/]
              }
          }
    ]
  }
}
```