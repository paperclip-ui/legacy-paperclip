// TODO - update this to include existing declaration
// values so that we don't have to redo it again.

const { scrape } = require("./utils");
const { uniq, flatten } = require("lodash");
const plimit = require("p-limit");
const { snakeCase } = require("lodash");

/*

Scrapes for all CSS declarations & values

*/

const CSS_REF_URL = "https://www.w3schools.com/cssref/";

async function getCSSProperties() {
  return scrape("https://www.w3schools.com/cssref/", $ => {
    return $("#cssproperties td > a")
      .map(function() {
        return [[$(this).text(), $(this).attr("href")]];
      })
      .get();
  });
}

async function getCSSPropertyValue(link) {
  return scrape("https://www.w3schools.com/cssref/" + link, $ => {
    return $(".w3-table-all.notranslate tr > td:first-child")
      .map(function() {
        return [
          [
            $(this)
              .text()
              .trim(),
            $(this).find("a").length > 0
          ]
        ];
      })
      .get();
  });
}

async function getCSSPropertyValues() {
  const declarations = [];
  const props = await getCSSProperties();
  const limit = plimit(30);

  const usedNames = {};

  await Promise.all(
    props.map(([name, link]) =>
      limit(async () => {
        if (usedNames[name]) {
          return;
        }
        usedNames[name] = true;

        const warnManual = () => {
          console.warn(`⚠️  "${name}" will have to be manually added`);
        };

        if (name.charAt(0) === "@") {
          return warnManual();
        }

        console.info(`🧲 scraping "${name}"`);
        try {
          let properties = await getCSSPropertyValue(link);

          properties = properties.filter(([propertyName]) => {
            if (
              /^(length|color|url|number|span n|time|keyframename|percentage|\w-offset|\w+-radius|\w-shadow)$|%|xpos|ypos|-axis|max-content|min-content\//.test(
                propertyName
              )
            ) {
              console.log(`◻️  skipping "${name}: ${propertyName}"`);
              return false;
            }

            if (/\(.*?\)/.test(propertyName)) {
              console.warn(
                `⚠️  "${name}: ${propertyName};" will have to be manually added`
              );
              return false;
            }
            return true;
          });

          const used = {};

          properties = properties
            .map(([prop, ref]) => {
              return [prop.replace(/[\s\n]+/g, " ").split(" "), ref];
            })
            .reduce((flattened, [props, ref]) => {
              return [...flattened, ...props.map(prop => [prop, ref])];
            }, [])
            .filter(prop => {
              if (used[prop[0]]) {
                return false;
              }
              used[prop[0]] = 1;
              return prop;
            });

          declarations.push({ name, properties });
        } catch (e) {
          warnManual();
        }
      })
    )
  );

  return declarations.sort((a, b) => {
    for (const [prop, ref] of a.properties) {
      if (ref && declarations.some(decl => decl.name === prop)) {
        return 1;
      }
    }

    return -1;
  });
}

function getValuesKey(name) {
  return `${snakeCase(name).toUpperCase()}_VALUES`;
}
function translateDeclarations(declarations) {
  const buffer = [`const {uniq} = require("lodash");\n\n`];

  for (const { name, properties } of declarations) {
    buffer.push(`const ${getValuesKey(name)} = uniq([\n`);

    for (const [valueName, ref] of properties) {
      if (ref) {
        if (declarations.some(decl => decl.name === valueName)) {
          buffer.push(`  ...${getValuesKey(valueName)},\n`);
        } else {
          console.warn(
            `⚠️ "${name}: ${valueName}" will have to be manually added.`
          );
        }
      } else {
        buffer.push(`  "${valueName}",\n`);
      }
    }

    buffer.push(`]);\n\n`);
  }

  buffer.push("export const CSS_DECLARATION_VALUE_MAP = {\n");

  for (const { name } of declarations) {
    buffer.push(`  "${name}": ${getValuesKey(name)},\n`);
  }

  buffer.push("};\n");

  return buffer.join("");
}

async function run() {
  const record = await getCSSPropertyValues();

  const code = translateDeclarations(record);
  console.log("\n\n\n");
  console.log(code);
}

run();
