[![Build Status](https://travis-ci.org/krisbulman/normalize-libsass.svg?branch=master)](https://travis-ci.org/krisbulman/normalize-libsass)

# normalize-libsass 1.0.2

A libsass compatible Sass port of normalize.css; a collection of HTML element and attribute style-normalizations.

This project was created because libsass does not currently import .css files. This can be an annoying problem when using a package manager such as bower. This port also leverages Sass variables for optional customization and inspired by [JohnAlbin's Compass port](https://github.com/JohnAlbin/normalize-scss). While this port is compatible with libsass, Ruby Sass 3.3, and Ruby Sass 3.3 + Compass, it does not use vertical rhythm mixins, if you wish to have vertical rhythm integrated in with your reset, then use John's Compass port.

# normalize.css v3.0.2

Normalize.css is a customisable CSS file that makes browsers render all
elements more consistently and in line with modern standards.

The project relies on researching the differences between default browser
styles in order to precisely target only the styles that need or benefit from
normalizing.

[View the test file](http://necolas.github.io/normalize.css/latest/test.html)

## Install

* Download directly from the [project page](https://github.com/krisbulman/normalize-libsass/releases).
* Install with [Bower](http://bower.io/): bower install --save normalize-libsass
* Install with [Component](http://component.io/): component install krisbulman/normalize-libsass

No other styles should come before _normalize.scss.

## How to use it

Prerequisite reading: [About normalize.css article](http://nicolasgallagher.com/about-normalize-css/).

To use the libsass port of Normalize, simply:

1. Copy the _normalize.scss file to your Sass directory
2. Import the partial into your main Sass file with @import "normalize";
and follow the "About normalize.css" article's suggestions:
  * Approach 1: Use _normalize.scss as a starting point for your own project's base Sass, customising the values to match the design's requirements. See the included ```!default``` variables that can be customized in your project.
  * Approach 2: Include _normalize.scss untouched and build upon it, overriding the defaults later in your Sass when necessary. Set ```$strict-normalize: true;``` in your project.

## What does it do?

* Preserves useful defaults, unlike many CSS resets.
* Normalizes styles for a wide range of elements.
* Corrects bugs and common browser inconsistencies.
* Improves usability with subtle improvements.
* Explains what code does using detailed comments.

## Browser support

* Google Chrome (latest)
* Mozilla Firefox (latest)
* Mozilla Firefox 4
* Opera (latest)
* Apple Safari 6+
* Internet Explorer 8+

[Normalize.css v1 provides legacy browser
support](https://github.com/necolas/normalize.css/tree/v1) (IE 6+, Safari 4+),
but is no longer actively developed.

## Extended details

Additional detail and explanation of the esoteric parts of normalize.css.

#### `pre, code, kbd, samp`

The `font-family: monospace, monospace` hack fixes the inheritance and scaling
of font-size for preformated text. The duplication of `monospace` is
intentional.  [Source](http://en.wikipedia.org/wiki/User:Davidgothberg/Test59).

#### `sub, sup`

Normally, using `sub` or `sup` affects the line-box height of text in all
browsers. [Source](http://gist.github.com/413930).

#### `svg:not(:root)`

Adding `overflow: hidden` fixes IE9's SVG rendering. Earlier versions of IE
don't support SVG, so we can safely use the `:not()` and `:root` selectors that
modern browsers use in the default UA stylesheets to apply this style. [SVG
Mailing List discussion](http://lists.w3.org/Archives/Public/public-svg-wg/2008JulSep/0339.html)

#### `input[type="search"]`

The search input is not fully stylable by default. In Chrome and Safari on
OSX/iOS you can't control `font`, `padding`, `border`, or `background`. In
Chrome and Safari on Windows you can't control `border` properly. It will apply
`border-width` but will only show a border color (which cannot be controlled)
for the outer 1px of that border. Applying `-webkit-appearance: textfield`
addresses these issues without removing the benefits of search inputs (e.g.
showing past searches).

#### `legend`

Adding `border: 0` corrects an IE 8–11 bug where `color` (yes, `color`) is not
inherited by `legend`.

## Contributing

Please read Necolas' [contributing guidelines](https://github.com/krisbulman/normalize-libsass/blob/master/CONTRIBUTING.md).

## Acknowledgements

Normalize.css is a project by [Nicolas Gallagher](https://github.com/necolas),
co-created with [Jonathan Neal](https://github.com/jonathantneal).

This libsass compatible port is a project by [Kris Bulman](https://github.com/krisbulman).
