#### What does a compiled template look like?

```javascript
const React = require("react");
import "./styles/global.css";
import ListItem from "./item.pc";
import Controls from "./controls.pc";
import Learn from "./learn.pc";

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = ".app-container[data-pc-5c5d0901] { background:#f5f5f5; width:100vw; height:100vh; position:absolute; top:0; } .todoapp[data-pc-5c5d0901] { background:#fff; margin:130px 0 40px 0; position:relative; box-shadow:0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1); } input[data-pc-5c5d0901]::-webkit-input-placeholder { font-style:italic; font-weight:300; color:#e6e6e6; } input[data-pc-5c5d0901]::-moz-placeholder { font-style:italic; font-weight:300; color:#e6e6e6; } input[data-pc-5c5d0901]::input-placeholder { font-style:italic; font-weight:300; color:#e6e6e6; } h1[data-pc-5c5d0901] { position:absolute; top:-155px; width:100%; font-size:100px; font-weight:100; text-align:center; color:rgba(220, 95, 224, 0.979); -webkit-text-rendering:optimizeLegibility; -moz-text-rendering:optimizeLegibility; text-rendering:optimizeLegibility; } .new-todo[data-pc-5c5d0901] { position:relative; margin:0; width:100%; font-size:24px; font-family:inherit; font-weight:inherit; line-height:1.4em; border:0; color:inherit; padding:6px; border:1px solid #999; box-shadow:inset 0 -1px 5px 0 rgba(0, 0, 0, 0.2); box-sizing:border-box; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; } .new-todo[data-pc-5c5d0901] { padding:16px 16px 16px 60px; border:none; background:rgba(0, 0, 0, 0.003); box-shadow:inset 0 -2px 1px rgba(0, 0, 0, 0.03); } .toggle-all[data-pc-5c5d0901] { text-align:center; border:none; opacity:0; position:absolute; } .toggle-all[data-pc-5c5d0901] + label[data-pc-5c5d0901] { width:60px; height:34px; font-size:0; position:absolute; top:-52px; left:-13px; -webkit-transform:rotate(90deg); transform:rotate(90deg); } .toggle-all[data-pc-5c5d0901] + label[data-pc-5c5d0901]:before { content:❯; font-size:22px; color:#e6e6e6; padding:10px 27px 10px 27px; } .toggle-all[data-pc-5c5d0901]:checked + label[data-pc-5c5d0901]:before { color:#737373; } .info[data-pc-5c5d0901] { margin:65px auto 0; color:#bfbfbf; font-size:10px; text-shadow:0 1px 0 rgba(255, 255, 255, 0.5); text-align:center; } .info[data-pc-5c5d0901] p[data-pc-5c5d0901] { line-height:1; } .info[data-pc-5c5d0901] a[data-pc-5c5d0901] { color:inherit; text-decoration:none; font-weight:400; } .info[data-pc-5c5d0901] a[data-pc-5c5d0901]:hover { text-decoration:underline; } .todo-list[data-pc-5c5d0901] { margin:0; padding:0; list-style:none; } .main[data-pc-5c5d0901] { position:relative; z-index:2; border-top:1px solid #e6e6e6; } @media screen and (-webkit-min-device-pixel-ratio: 0) { .toggle-all[data-pc-5c5d0901] { background:none; } }";
  document.body.appendChild(style);
}

export function styled(tagName, defaultProps) {
  return function(props) {
    return React.createElement(tagName, Object.assign({ "data-pc-5c5d0901": true, "data-pc-62a38472": true, }, defaultProps, props));
  };
}

function AppView(props) {
  return React.createElement("div", {
      "data-pc-5c5d0901": true,
      "data-pc-62a38472": true,
      "key": "0",
      "className": "app-container",
    },
    React.createElement("div", {
        "data-pc-5c5d0901": true,
        "data-pc-62a38472": true,
        "key": "1",
        "className": "app",
      },
      React.createElement(Learn, {
          "data-pc-5c5d0901": true,
          "data-pc-62a38472": true,
          "key": "2",
        }
      ),
      React.createElement("section", {
          "data-pc-5c5d0901": true,
          "data-pc-62a38472": true,
          "key": "3",
          "className": "todoapp",
        },
        React.createElement("header", {
            "data-pc-5c5d0901": true,
            "data-pc-62a38472": true,
            "key": "4",
            "className": "header",
          },
          React.createElement("h1", {
              "data-pc-5c5d0901": true,
              "data-pc-62a38472": true,
              "key": "5",
            },
            "Todos"
          ),
          React.createElement("input", {
              "data-pc-5c5d0901": true,
              "data-pc-62a38472": true,
              "key": "6",
              "onKeyPress": props.onNewTodoKeyPress,
              "id": "new-todo-input",
              "autoFocus": "autofocus",
              "autoComplete": "off",
              "placeholder": "What needs to be done?",
              "className": "new-todo",
            }
          )
        ),
        React.createElement("section", {
            "data-pc-5c5d0901": true,
            "data-pc-62a38472": true,
            "key": "7",
            "className": "main",
          },
          React.createElement("input", {
              "data-pc-5c5d0901": true,
              "data-pc-62a38472": true,
              "key": "8",
              "id": "toggle-all",
              "type": "checkbox",
              "className": "toggle-all",
            }
          ),
          React.createElement("label", {
              "data-pc-5c5d0901": true,
              "data-pc-62a38472": true,
              "key": "9",
              "htmlFor": "toggle-all",
            },
            "Mark all as complete"
          ),
          React.createElement("ul", {
              "data-pc-5c5d0901": true,
              "data-pc-62a38472": true,
              "key": "10",
              "className": "todo-list",
            },
            props.items
          )
        ),
        props.controls
      ),
      React.createElement("footer", {
          "data-pc-5c5d0901": true,
          "data-pc-62a38472": true,
          "key": "11",
          "className": "info",
        },
        React.createElement("p", {
            "data-pc-5c5d0901": true,
            "data-pc-62a38472": true,
            "key": "12",
          },
          "Double-click to edit a todo"
        ),
        React.createElement("p", {
            "data-pc-5c5d0901": true,
            "data-pc-62a38472": true,
            "key": "13",
          },
          "Written by ",
          React.createElement("a", {
              "data-pc-5c5d0901": true,
              "data-pc-62a38472": true,
              "key": "14",
              "href": "http://github.com/crcn",
            },
            "Craig Condon"
          )
        ),
        React.createElement("p", {
            "data-pc-5c5d0901": true,
            "data-pc-62a38472": true,
            "key": "15",
          },
          "Part of ",
          React.createElement("a", {
              "data-pc-5c5d0901": true,
              "data-pc-62a38472": true,
              "key": "16",
              "href": "http://todomvc.com",
            },
            "TodoMVC"
          )
        )
      )
    )
  );
}

export default AppView;
```