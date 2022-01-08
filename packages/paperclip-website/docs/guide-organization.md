---
id: guide-previews
title: Paperclip Previews
sidebar_label: Previews
---

Previews are a way for you to see every visual state of your UI. Here's a basic example:

```html live showAllFrames height=700
// file: main.pc
<import src="styles.pc" inject-styles />
<!--
  @frame { visible: false }
-->
<div component as="Checkbox" class="checkbox">
  <input type="checkbox" {checked?} />
  <div class="dummy" />
</div>


<!--
  @frame { visible: false }
-->
<li export component as="TodoItem" class:alt="alt">
  <style>
    display: flex;
    align-items: center;
    gap: 16px;
  </style>
  <Checkbox {checked?} />
  {children}
</li>
    
<!--
  @frame { visible: false }
-->
<div export component as="App" class="app">
  <div class="header">
    <h1>{title}</h1>
    <form>
      <input placeholder="new todo" />
      <button>
        Add todo
      </button>
    </form>
  </div>
  <ul class="todo-items">
    {todos}
  </ul>
</div>

<!--
  @frame { title: "Todos / Mobile", width: 412, height: 768, x: 472, y: 89 }
-->
<App title="Add todos" todos={<fragment>  
  <TodoItem>Pick up keys</TodoItem>
  <TodoItem alt checked>talk dog</TodoItem>
  <TodoItem>Pick up milk</TodoItem>
</fragment>} />


<!--
  @frame { title: "Todos / Desktop", width: 1049, height: 768, x: -670, y: 96 }
-->
<App title="Add todos" todos={<fragment>  
  <TodoItem>Pick up keys</TodoItem>
  <TodoItem alt checked>talk dog</TodoItem>
  <TodoItem>Pick up milk</TodoItem>
</fragment>} />

// file: styles.pc

<style>
  
  @mixin mobile {
    @media screen and (max-width: 480px) {
      @content;
    }
  }

  @export {
    .app {
      font-family: sans-serif;
    }

    .checkbox {
      position: relative;
      width: 30px;
      height: 30px;
      .dummy {
        width: 100%;
        height: 100%;
        border: 1px solid currentColor;
        border-radius: 99px;
        position: absolute;
        pointer-events: none;
        top: 0px;
        left: 0px;
        &:before {
          visibility: hidden;
          font-size: 16px;
          color: currentColor;
          content: "✔";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }

      input {
        opacity: 0;
        top: 0px;
        left: 0px;
        margin: 0px;
        width: 100%;
        height: 100%;
        z-index: 1;
        &:checked ~ .dummy {
          background: rgb(90, 209, 245);
          color: rgba(255, 255, 255, 0.8);
          border-color: rgb(90, 209, 245);
          &:before {
            visibility: visible;
          }
        }
      }
    }

    .todo-items {
      list-style-type: none;
      margin: 0px;
      padding: 0px;
      color: #777;
      li {
        background: #e0e0e0;
        padding: 32px;
        &.alt {
          background: #e9e9e9;
        }
      }
    }
    
    .header {
      background: #999;
      color: white;
      padding: 32px;


      h1 {
        margin: 0px;
        margin-bottom: 16px;
      }

      form {
        display: flex;
        gap: 8px;
      }

      button, input {
        border-radius: 99px;
        border: 1px solid white;
        padding: 8px 12px;
      }

      button {
        background: white;
        color: #999;
        font-weight: 600;
        white-space: nowrap;
      }

      input {
        background: transparent;
        @include mobile {
          width: 100%;
        }
        &::placeholder {
          color: white;
        }
      }
    }
  }
</style>
```

To see previews locally, just run the following command in your project directory:

```
yarn paperclip designer
```

You can think of previews as a bit of a scratch pad for your UIs. They're nice to use when building UIs out initially since Paperclip compiles in realtime. You can also think of previews as unit tests for your UIs since previews defined within Paperclip are covered for [visual regressions](visual-regression-tooling).

To keep your previews more DRY, you can combine them into one master preview component. For example:

```html
<!--
  @frame { visible: false, title: "Base Preview", width: 1742, height: 1001, x: 1395, y: -595 }
-->
<App export component as="Preview" 
  {class?}
  class:showBranded="show-branded">
  <style>
    &.show-branded {
      --primary-color: rgb(223, 20, 20);
    }
  </style>
  <Topbar.Preview showLoggedIn {showBranded?} />
  <Container sidebar={<Sidebar.Preview />}>

    <!-- company profile -->
    {showCompanyProfile && <Content>
      <CompanyProfile.Preview />
    </Content>}

    <!-- mnda -->
    {showMNDA && <Content>
      <MNDA.Preview />
    </Content>}
    
    <!-- MNDA signed -->
    {showMNDASigned && <Content>
      <MNDA.Preview2 />
    </Content>}

     { showSkipDataSync && <Content>
      <SkipDataSync.Preview />
    </Content>}
  </Container>

  { showWelcome && <WelcomeOverlay.Preview>
  </WelcomeOverlay.Preview>}

  <!-- more variants ... -->
</App>


<!--
  @frame { title: "Onboarding / Welcome", width: 1531, height: 816, x: -275, y: -1705 }
-->
<Preview showCompanyProfile showWelcome />

<!--
  @frame { title: "Onboarding / MNDA", width: 1531, height: 816, x: -296, y: 503 }
-->
<Preview showMNDA showBranded>
  <style>
    --primary-color: rgb(0, 255, 128);
  </style>
</Preview>

<!--
  @frame { title: "System Connect", width: 1531, height: 991, x: -318, y: 1860 }
-->
<Preview showSystemConnect />

<!-- move variants below -->
```

This way, you keep all of your visual states in one spot which makes it easier to maintain. Here's what the code above looks like:

![onboarding](/img/preview-variants.gif)

