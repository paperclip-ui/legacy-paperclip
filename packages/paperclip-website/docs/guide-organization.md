---
id: guide-previews
title: Paperclip Previews
sidebar_label: Previews
---

Previews are a way for you to see your all of your primitive components together. Here's a basic example:

```html
<!-- Component building blocks section. Keep them invisible -->

<div export component as="SomeComponent">

  <!-- Keep styles defined in the elements that they're styling -->
  <style> 
    padding: 20px;
    background: #333;
  </style>
  {children}
</div>

<div export component as="AnotherComponent">
  <style>
    /* ... */
  </style>
  {children}
</div>

<!-- preview -->

<SomeComponent>
  <AnotherComponent />
</SomeComponent>

<!-- another preview -->

<SomeComponent>
  <AnotherComponent />
  <AnotherComponent />
  <AnotherComponent />
</SomeComponent>
```

You can see these previews live by running `npx paperclip-cli designer`.

You can think of previews as a bit of a scratch pad for your UIs. They're nice to use when building UIs out initially since Paperclip compiles in realtime, so you're never waiting around. You can also think of previews as unit tests for your primitive components since previews defined within Paperclip are covered for visual regressions.

To keep your previews more DRY, you can combine them into one master preview component. For example:

```html
<!--
  @frame { visible: false, title: "Base Preview", width: 1742, height: 1001, x: 1395, y: -595 }
-->
<App export component as="Preview" 
  {className?}
  className:showBranded="show-branded">
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

This way, you keep all of your visual states in one spot which makes it easier to maintain, and preview different states of your app for visual development and visual regression coverage.

![onboarding](/img/preview-variants.gif)

