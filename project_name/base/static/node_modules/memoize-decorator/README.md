# memoize decorator

This is a method/getter decorator which is when applied to a method or a getter
memoizes the result of the first call and returns it on subsequent calls.

As decorators are a part of future ES7 standard they can only be used with
transpilers such as [Babel](http://babeljs.io).

Installation:

    % npm install memoize-decorator

Example:

    import memoize from 'memoize-decorator'

    class Component {

      @memoize
      get expensiveValue() {
        console.log('heavy computations')
        return 42
      }
    }

    let component = new Component()
    component.expensiveValue // prints 'heavy computations', returns 42
    component.expensiveValue // just returns 42
