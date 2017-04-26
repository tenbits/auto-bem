Auto BEM for Components
----

[![Build Status](https://travis-ci.org/tenbits/autoBem.png?branch=master)](https://travis-ci.org/tenbits/autoBem)
[![NPM version](https://badge.fury.io/js/auto-bem.svg)](http://badge.fury.io/js/auto-bem)

## Framework-agnostic BEM Transformer API for HTML, CSS or Mask

Creates Scoped CSS by **replacing** selectors (_block_ and _elements_) in CSS with unique names, and **adding** those names to the matched elements in HTML

> :rocket: This module gives you only the functions. You may want to integrate them into your favorite Build-Tool.

> :exclamation: Important: You can still use **BEM methodology**, but now you can be sure that the name collisions are not more possible, so you can feel yourself **relaxed** in planning the names for your blocks and elements. 

----

##### &#9776;

- `1` [Understand the idea](#1-understand-the-idea)
    - `1.1` [Block and Element](#11-block-and-element)
    - `1.2` [Modifiers](#12-modifiers)
    - `1.3` [Host](#13-host)
- `2` [API](#2-api)
    - `2.1` [Require](#21-require)
    - `2.2` [Transform](#22-transform)
        - `2.2.1` [Options](#221-options)
        - `2.2.2` [Result](#222-result)
    - `2.3` [Two-Step Transform](#23-two-step-transform)

- `3` [Tests](#3-tests)

    
# `1` Understand the idea

### `1.1` Block and Element

```html
<div class='foo'>
    <header><span class='title'></span></header>
    <ul>
        <li class='item'></li>
    </ul>
</div>
```
```css
.foo {}
.foo header > .title {}
.foo ul {}
.foo .item {}
/* Raw CSS sample. LESS or SASS would look better */
```

The example above is not about how you should write your CSS, it only shows the idea about selector transformations. The output will be:

```html
<div class='foo_SALT foo'>
    <header>
        <span class='foo_SALT__tag_header__child__title title'></span>
    </header>
    <ul class='foo_SALT__tag_ul'>
        <li class='foo_SALT__item item'></li>
    </ul>
</div>
```
```css
.foo_SALT {}
.foo_SALT__tag_header__child__title {}
.foo_SALT__tag_ul {}
.foo_SALT__item {}
```

> Notice: 
> - CSS has only the generated class names
> - The generated classes are inserted into the HTML 
> - Old CSS classes are preserved in HTML (_in case you want later extend the styles from outside or find them from js._)

## `1.2` Modifiers

<h4><font color="lightcoral"><b>We do not transform the modifiers, neither in CSS nor in HTML</b></font></h4>

_Two reasons for this decision:_

1. We leave the original modifier names in css, to toggle them in the runtime. 
2. (_Imho section_) Modifiers usually represent some state of the element or block, and, actually, this state can be block- or element-independent. For example: `.is-visible`, `.is-active`, `.type-image`, `.theme-summer`. Even when to 2 elements are on the same node, it doesn`t matter which one implements and supports the state.

```html
<div class='foo is-selected'>
    <span class='title'></span>    
</div>
```
```css
.foo.is-selected { /*...*/ }
.foo.is-selected .title { /*...*/ }
```

Outputs:
```html
<div class='foo_SALT foo is-selected'>
    <span class='foo_SALT__title'></span>
</div>
```
```css
.foo_SALT.is-selected { /*...*/ }
.foo_SALT.is-selected .foo_SALT__title { /*...*/ }
```


### `1.3` Host

```html
<div>
    <header><span class='title'></span></header>
    <ul>
        <li class='item'></li>
    </ul>
</div>
```
```css
:host {}
header > .title {}
ul {}
.item {}
```

The output of the transformion with the defined filename, e.g. `/some/path/to/MyComponent.html`

```html
<div class="MyComponent_SALT">
    <header>
        <span class='MyComponent_SALT__tag_header__child__title title'></span>
    </header>
    <ul class='MyComponent_SALT__tag_ul'>
        <li class='MyComponent_SALT__item item'></li>
    </ul>
</div>
```
```css
.MyComponent_SALT {}
.MyComponent_SALT__tag_header__child__title {}
.MyComponent_SALT__tag_ul {}
.MyComponent_SALT__item  {}
```


---


# `2` API

### `2.1` Require
```js
var autoBem = require('auto-bem');
```

### `2.2` Transform

Transform both, CSS and the template, at once.

`.transform(template: string, css: string, options: Options): Result`

### `2.2.1` Options


| Key | Type | Default | Description|
|-----|------|---------|:-----------|
| `scopeId` | `string` | `null` | Define your own block name. Per default we try to find the id by block name or the filename |
|`scopeType`| `string` | `'block' | 'host'` | Per default we try to find out, if your css describes a block or host styles. | 
| `useSalt` | `boolean`| `true` | Add a unique salt, when generating the block name, to ensure the block name is absolutely unique |
| `templateType` | `string` | `html` | For now, we support `html` and `mask` syntax |
| `filename` | `string` | `null` | Path to the template. Primary, will be used to get the BlockName by FileName for the `:host` styles, otherwise only SALT will be generated|

### `2.2.2` Result

Returns transformed template and styles.

```js
{
    template: string,
    css: string
}
```

### `2.3` Two-Step Transform

Sometimes you may want to apply one stylesheet to different templates. There for create the `BemCss` instance of the stylesheet and apply it to different templates.

```js
class BemCss {
    constructor (cssText: string, options?: StyleOptions),
    /* Transformed css */
    getStyle (),
    /* transform template */
    transformTemplate (template: string, options?: TemplateOptions)
}

StyleOptions = {
    scopeId?,
    scopeType?,
    useSalt?,
    filename?
};
TemplateOptions = {
    templateType?
};
```

```js
let bemCss = new AutoBem.BemCss(myCssText, StyleOptions)

let cssText  = bemCss.getStyle();
let tmplText = bemCss.transformTemplate(template, TemplateOptions)

console.log(cssText, tmplText);
```


# `3` Tests

See the [tests](test/node/transformHtml.test) for more examples.


---

> :heart: We love any kind of questions and suggestions.

:copyright: 2017 - MIT
