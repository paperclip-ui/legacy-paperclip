---
id: introduction
title: Introduction
sidebar_label: Introduction
---

Paperclip is a tool that specializes in just the appearance of your application, and it only covers HTML, CSS, and primitive components.

I'd recommend that you play around with the [Playground](https://playground.paperclip.dev) to get a feel for the tool. 

## Motivation

Bret Victor's talk on [inventing on principle](https://www.youtube.com/watch?v=PUv66718DII&t=130s) was a major influence for this project. The main question when starting this tool was "how can front-end development feel more like Figma or Sketch?". Front-end development _is visual_, so why not start there? Paperclip is the result of [many iterations trying to answer this question](https://levelup.gitconnected.com/lessons-around-creating-ui-builders-46ceeaea327f). 

### Development speed

The main issue that Paperclip tries to solve is development speed. Typically you may to wait a few seconds for your HTML & CSS changes to appear in the browser, but with Paperclip, changes appear instantly. Here's a demo of Paperclip in action for a pretty large project:

![Captec.io onboarding](/img/super-fast.gif)


### Explicit CSS

One of the problems with CSS is that it's global, and can make it hard to tell what elements are being styled. Paperclip aims to solve that by making CSS scoped. This means that CSS defined or included within each document is only applied to that document. For example:

```html
<style>
  div {
    color: red;
  }
</style>

<div>
  I'm red text
</div>
```

The `div { }` selector is only applied to the elements within this document. To make CSS global, you need to explicitly define `:global(div) { }`-like selectors. This way you know exactly what is and isn't global. 


### Visual regressions


All previews defined within Paperclip are covered for visual regressions - you can think of this like type safety for UI development. This means that you can easily maintain any HTML & CSS that you write, regardless of how it's all written. 

### Other motivations

The other goal for Paperclip is to lower the barrier to front-end development for designers that want more control. As the project continues to evolve, there will be more tooling that will enable them to do that (through visual & sync tools).

---

## Who is Paperclip intented for?


Paperclip is intended for anyone looking to create Single Page Applications - big or small, and any team size. 

### Small projects & startups

Paperclip is great for small projects since it will enable you to iterate more quickly on your UIs, and get features out the door more quickly. This is especially useful for startups that depend on user feedback for driving feature development. 

### Big projects and teams

If you already have a big project, then the benefits of moving over to Paperclip are:

- Paperclip wrangles any messy CSS you have by keeping it scoped, and covered for visual regression tests.
- Product development moves faster since UI development is faster in Paperclip (developers don't have to wait for their code to compile).
- Paperclip gives developers complete freedom to write HTML & CSS however they want, and without the need for BEM, SMACSS, and other styling patterns.


### I'm already using Tailwind / Bulma / Bootstrap / etc.

Paperclip compliments existing frameworks like Tailwind and Bootstrap by keeping them _scoped_ to the UI you want them applied to. For example:

```html
<import src="./tailwind.css" inject-styles />


<!--
  @frame { width: 768, height: 768, x: 0, y: 0 }
-->

<div class="font-sans bg-gray-500 h-screen w-screen">
  <div class="bg-gray-100 rounded-lg p-8 md:p-0">
    <div class="pt-6 text-center space-y-4">
      <blockquote>
        <p class="text-lg font-semibold">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </blockquote>
      <figcaption class="font-medium">
        <div class="text-blue-600">
          sit voluptatem
        </div>
      </figcaption>
    </div>
  </div>
</div>
```

👆 Tailwind in this case is only applied to this document. The benefits to this approach are that:

- You know exactly what's being styled
- You can avoid vendor lock-in with third-party CSS
- You can avoid CSS collisions

Paperclip doesn't replace CSS frameworks, it greatly compliments them, and helps keep your codebase in a state that can continue to scale and grow depending on your users' needs. 
