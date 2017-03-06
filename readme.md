**_work in progress_**

Auto BEM
----

[![Build Status](https://travis-ci.org/tenbits/autoBem.png?branch=master)](https://travis-ci.org/tenbits/autoBem)

#### HTML and CSS Transformer API

Creates Scoped CSS by replacing the selectors in CSS with unique names, and adding those names to the matched elements in HTML/Mask

> For now, the module gives you only the function. You may want to integrate them into your favorite Build-Tool.



#### Options

| Key | Type | Default | Description|
|-----|------|---------|:-----------|
| `scopeId` | `string` | `null` | Define your own block name |
| `useSalt` | `boolean`| `true` | Add a unique salt, when generating the block name, to ensure the block name is absolutely unique |
| `templateType` | `string` | `html` | For now, we support `html` and `mask` syntax |


#### Examples

```html
<div class='foo'>
    <ul>
        <li class='item'></li>
    </ul>
</div>
```
```less
// less sample
.foo {
    ul {}
    .item {}
}
```

The example above is not about how you should write your CSS, it only shows the idea about selector transformations. The output will be:

```html
<div class='foo_SALT foo'>
    <ul class='foo_SALT__tag_ul'>
        <li class='foo_SALT__item item'></li>
    </ul>
</div>
```
```css
.foo_SALT {}
.foo_SALT__tag_ul {}
.foo_SALT__item {}
```

> Notice: CSS has only the generated class names, and HTML has those classes and the old classes are also preserved, in case you want later extend the styles from outside.



:copyright: 2017 - MIT
