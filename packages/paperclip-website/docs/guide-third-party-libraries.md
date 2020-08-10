---
id: guide-third-party-libraries
title: Using Third-party Libraries
sidebar_label: Third-party Libraries
---

## Third-party CSS

> The ergonomics for this aren't ideal, and I plan on making tooling to make this experiense better.

If you're using third-party CSS such as Bootstrap or Tailwind, you'll need to move the CSS over
to a `*.pc` file. For example:

```css
.my-1 {
  /* tailwind code */
}

.my-2 {
  /* tailwind code */
}

.text-color-black-100 {
  /* tailwind code */
}
```

This must be converted to Paperclip like so:

```css
<style>
  @export {
    .my-1 {
      /* tailwind code */
    }

    .my-2 {
      /* tailwind code */
    }

    .text-color-black-100 {
      /* tailwind code */
    }
  }
</style>
```

> The `@export` block is necessary for CSS that you plan on using in other Paperclip files, since Paperclip requires _explicity_. You can make all selectors global with `:global` if you really want to, but I don't recommend that because you're losing safety in favor of convenience. 

☝ Here's how you can use these styles in another Paperclip file:

```html
<import src="modules/tailwind.pc" as="tw">

<div className=">>>tw.text-color-black-100 >>>tw.my-1">
  Something
</div>
```

The [Tailwind example](https://github.com/crcn/paperclip/tree/master/examples/tailwind) is a good place to start if you're looking to do this.

## Styling third-party components

You may use classes defined in Paperclip on third-party components. Here's a simple example:

```html
<style>
  @export {
    .my-styles {

      /* some components may have nested style rules in the global namespace. 
      In that case you can use the :global selector */
      :global(.nested-rule) {

      }
    }
  }
</style>
```

Then, in your JSX code:

```jsx
import * as ui from "./Component.pc";
import SomeThirdPartyComponent from "some-third-paty-component";

<SomeThirdPartyComponent className={ui.classNames["my-style"]} />
```

☝ this works for many cases. However, it's a bit inconvenient since you'll be using the browser
in order to debug your styles. To make things easier, you can copy & paste the third-party component's HTML & CSS directly in your PC file & open it up in VS Code to visually style it. Don't worry, this approach is only a guide to make custom styling easier. It's not for production.

![alt copy-paste html](/img/third-party-libraries/copy-paste.gif)

Let's use a real example now. Here's a custom theme for the [react select](https://react-select.com/) module:

```html live
// file: Select.pc

<import src="./tokens.pc">

<!-- style overrides -->
<style>
  .wrapper {
    :global(.select__) {
      &control {
        display: flex;
        background: var(--color-background);
        border: none;
        border-radius: var(--border-radius-default) var(--border-radius-default) 0 0;
        color: var(--color-white-default);
        border-bottom: 1px solid #575752;
        transition: box-shadow 300ms ease-in-out;
        cursor: pointer;
        box-sizing: border-box;
        padding-bottom: 2px;
        padding-top: 1px;
        transition: border 120ms ease-in-out;

        &--is-focused {
          border-bottom: 1px solid #fff;
          background: var(--color-background-lighter);
          box-shadow: none;
          outline: none;
        }
        &:hover {
          border-bottom: 1px solid #fff;
        }
      }
      &value-container,
      &single-value,
      &multi-value__label,
      &input {
        color: var(--color-white-default);
      }
      &menu-list,
      &multi-value {
        background: var(--color-background);
        box-shadow: var(--shadow-4);
        border-radius: 4px;
      }
      &multi-value {
        border: 1px solid #575752;
      }
      &option {
        color: var(--color-white-default);
        cursor: pointer;
        transition: background 70ms ease-in-out;

        &--is-focused {
          background: var(--color-grey-300);
        }
        &--is-selected {
          background:  var(--color-black-100);
          font-weight: 600;
        }
        &--is-selected.select__option--is-focused {
          background:  var(--color-grey-300);
        }
        &:hover {
          background:  var(--color-background);
        }
      }
      &placeholder,
      &single-value {
        user-select: none;
      }
    }
  }

  .preview {
    padding: 30px;
    background: var(--color-black-default);
    width: 100vw;
    height: 100vh;
    box-sizing: border-box;
    font-family: sans-serif;
  }

</style>

<!-- TODO - need some way to omit this from the build. Maybe no-compile attribute -->
<style>

  /* copied from chrome. Here just for the preview */
  .css-2b097c-container {
    position:relative;
    box-sizing:border-box;
  }

  .css-1ml51p6-MenuList {
    max-height:300px;
    overflow-y:auto;
    padding-bottom:4px;
    padding-top:4px;
    position:relative;
    -webkit-overflow-scrolling:touch;
    box-sizing:border-box;
  }
  
  .css-yt9ioa-option {
    background-color:transparent;
    color:inherit;
    cursor:default;
    display:block;
    font-size:inherit;
    padding:8px 12px;
    width:100%;
    -webkit-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;
    -webkit-tap-highlight-color:rgba(0,0,0,0);
    box-sizing:border-box;
  }

  .css-1uccc91-singleValue {
    color:hsl(0,0%,20%);
    margin-left:2px;
    margin-right:2px;
    max-width:calc(100% - 8px);
    overflow:hidden;
    position:absolute;
    text-overflow:ellipsis;
    white-space:nowrap;
    top:50%;
    -webkit-transform:translateY(-50%);
    -ms-transform:translateY(-50%);
    transform:translateY(-50%);
    box-sizing:border-box;
  }
  .css-26l3qy-menu {
    top:100%;
    border-radius:4px;
    box-shadow:0 0 0 1px hsla(0,0%,0%,0.1),0 4px 11px hsla(0,0%,0%,0.1);
    margin-bottom:8px;
    margin-top:8px;
    position:absolute;
    width:100%;
    z-index:1;
    box-sizing:border-box;
  }


  .css-1hwfws3 {
    align-items:center;
    display:flex;
    flex:1;
    flex-wrap:wrap;
    padding:2px 8px;
    -webkit-overflow-scrolling:touch;
    position:relative;
    overflow:hidden;
    box-sizing:border-box;
  }

  .css-w8afj7-Input {
    margin:2px;
    padding-bottom:2px;
    padding-top:2px;
    visibility:visible;
    color:hsl(0,0%,20%);
    box-sizing:border-box;
  }

  .css-tj5bde-Svg {
    fill: currentColor;
    line-height: 1;
    stroke: currentColor;
    stroke-width: 0;
  }
  .css-1okebmr-indicatorSeparator {
    align-self:stretch;
    background-color:hsl(0,0%,80%);
    margin-bottom:8px;
    margin-top:8px;
    width:1px;
    box-sizing:border-box;
  }
  
  .css-yk16xz-control {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    padding: 2px 8px;
    overflow: hidden;
    box-sizing: border-box;
  }
</style>


<div export component as="Wrapper" className="wrapper">
  {children}
</div>
  
<div className="preview">
  <Wrapper>

   <!-- coppied from Chrome inspector -->
  <div class="StyledSelect-sc-1taf1wi-0 hAUldd css-2b097c-container">
    <div class="select__control select__control--menu-is-open css-yk16xz-control">
        <div class="select__value-container select__value-container--has-value css-1hwfws3">
          <div class="select__single-value css-1uccc91-singleValue">Last modified</div>
          <div class="css-w8afj7-Input">
              <div class="select__input" style="display: inline-block;">
                <input autocapitalize="none" autocomplete="off" autocorrect="off" id="Sort by" spellcheck="false" tabindex="0" type="text" aria-autocomplete="list" aria-label="Sort by" style="box-sizing: content-box; width: 2px; background: rgba(0, 0, 0, 0) none repeat scroll 0px center; border: 0px none; font-size: inherit; opacity: 1; outline: currentcolor none 0px; padding: 0px; color: inherit;" value="">
                <div style="position: absolute; top: 0px; left: 0px; visibility: hidden; height: 0px; overflow: scroll; white-space: pre; font-size: 16px; font-family: Eina, sans-serif; font-weight: 400; font-style: normal; letter-spacing: normal; text-transform: none;"></div>
              </div>
          </div>
        </div>
        <div class="select__indicators css-1g48xl4-IndicatorsContainer">
          <span class="select__indicator-separator css-1okebmr-indicatorSeparator"></span>
          <div aria-hidden="true" class="select__indicator select__dropdown-indicator css-tlfecz-indicatorContainer">
              <svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="css-tj5bde-Svg">
                <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
              </svg>
          </div>
        </div>
    </div>
    <div class="select__menu css-26l3qy-menu">
        <div class="select__menu-list css-1ml51p6-MenuList">
          <div class="select__option select__option--is-focused css-yt9ioa-option" id="react-select-2-option-0" tabindex="-1">Alphabetically</div>
          <div class="select__option css-yt9ioa-option" id="react-select-2-option-1" tabindex="-1">Most recently added</div>
          <div class="select__option select__option--is-selected css-yt9ioa-option" id="react-select-2-option-2" tabindex="-1">Last modified</div>
        </div>
    </div>
  </div>

  </Wrapper>
</div>

// file: tokens.pc

<style>
  :root {
    --border-radius-default: 4px;
    --color-white-default: #f5f5f3;

    --color-grey-300: #6b6b65;

    --color-black-400: #252524;
    --color-black-200: #2d2d2a;
    --color-black-100: #2f2f2c;
    --color-black-default: #171716;

    --color-background: rgba(46, 45, 42, 0.9);
    --color-background-lighter: rgba(46, 45, 42, 1);
  }

</style>
```

Here's how we can apply this theme in React code:

```jsx
import { Wrapper as SelectWrapper } from './Select.pc';
import Select from 'react-select';

function StyledSelect(props) {
  return (    
    <SelectWrapper>
      <Select classNamePrefix="select" {...props} />
    </SelectWrapper>
  );
}
```

That's all there is to it really. 