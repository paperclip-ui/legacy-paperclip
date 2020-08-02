---
id: guide-why
title: Why Paperclip?
sidebar_label: Why
---


### Web development is slow 

There are a number of reasons why Paperclip was created. The main one is out of the frustration around how slow and inefficient web development generally is. The endless loop around writing HTML & CSS & debugging in the browser is  bottleneck to the development process.

![Slow HMR demo](/img/slow-hmr.gif)

I find that most React components are incredibly simple. Most of the time they render basic HTML & CSS that HTML & CSS alone can handle. Rarely is there a need for more complicated behavior. That, and I've found that a lot of codebases separate styled components from logic anyways, so why not take advantage of that separation? By using a tool that's special-purpose for writing HTML & CSS, we can eliminate the browser refresh issue entirely, and also introduce _new_ tooling to optimize the developer experience around HTML & CSS development. That's why Paperclip was developed.

![alt faster UI](/img/faster-ui.gif)

Paperclip only handles HTML, CSS, and primitive components. And because it doesn't have to handle the entire weight of your codebase, it's _fast_, and _remains_ fast even as your project grows. 


### CSS is buggy

Another reason why Paperclip 