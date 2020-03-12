const fs = require("fs");

// simulate large codebase
const FILE_COUNT = 700;

for (let i = 0, n = FILE_COUNT; i < n; i++) {
  fs.writeFileSync(`${__dirname}/../src/module-${i}.pc`, `

    <!-- styles are not part of diff / patch, so they're a bit slow for now. -->
    <!--style>
      div {
        color: grey;
        font-family: Helvetica;
      }
    </style-->
    <div export component as="default"> 
      <h4>Module ${i}</h4>
      ${
        Array.from({ length: 100 }).map((_, j) => `<span>${j}</span>`).join("\n")
      }
      <hr />
    </div>

    <!-- preview -->
    <default />
  `); 
}

fs.writeFileSync(`${__dirname}/../src/index.pc`, `
  ${
    Array.from({ length: FILE_COUNT }).map((_, i) => {
      return `<import as="module${i}" src="./module-${i}.pc" />`
    }).join("\n")
  }
  ${
    Array.from({ length: FILE_COUNT }).map((_, i) => {
      return `<module${i} />`;
    }).join("\n")
  }
`);