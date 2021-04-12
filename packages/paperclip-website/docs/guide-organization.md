---
id: guide-organization
title: Paperclip Organization
sidebar_label: Organization
---

The general structure that I'd recommend for Paperclip content is:

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


Writing previews may seem a bit redundant since they'll reflect your React components - there's some duplicate code, but they are import to define for a few reasons:

- Previews double up as visual regression tests if you're using the [Percy](configure-percy) integration.
- Previews act as documentation for seeing _every_ visual state of a component.
- Previews allow you to design your app without needing to spin up a development server.

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

Be sure _not_ to include preview components into your React code - previews are just used for development and testing purposes. 


# Organizing files

My recommendation is to keep `PC` files alonside the React components that are using them. For example:

```
components/
  TabNavigation.pc
  TabNavigation.tsx
```

Another good pattern is to have a master `components.pc` file that contains _all_ of your design system elements. For example:

![design system](/img/ds-preview.gif)

> This is our current WIP design system at [Capital](https://captec.io)


The benefit of having this is that you can see _everything_ in one spot. Here's what your folder structure might look like:

```
design-system/
  components.pc
  Button.tsx
  TabNavigation.tsx
  Modal.tsx
```

Then, in each of your components, just include what's needed from `components.pc`:

```jsx
import React, { useCallback, useEffect, useState } from 'react';
import * as styles from './components.pc';

export type ModalProps = {
  visible?: boolean;
  closable?: boolean;
  header?: any;
  narrow?: boolean;
  padded?: boolean;
  wide?: boolean;
  children: any;
  side?: boolean;
  footer?: any;
  onClose?: any;
};

export const Modal = ({
  header,
  side,
  closable,
  narrow,
  wide,
  children,
  padded,
  visible = true,
  onClose,
  footer,
}: ModalProps) => {
  const { isOpen, transitioning, onBackgroundClick } = useModal({
    closable,
    onClose,
    visible,
  });

  // if closed & done transitioning, then do not render modal.
  if (!isOpen && !transitioning) {
    return null;
  }

  return (
    <styles.Modal
      side={side}
      visible={isOpen}
      onBackgroundClick={onBackgroundClick}
    >
      <styles._ModalContent
        padded={padded}
        wide={wide}
        narrow={narrow}
        footer={footer}
      >
        {header && <styles._ModalHeader>{header}</styles._ModalHeader>}
        {children}
      </styles._ModalContent>
    </styles.Modal>
  );
};
```