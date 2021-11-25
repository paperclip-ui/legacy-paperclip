// import { expect } from "chai";
// import { EngineDelegate } from "paperclip";
// import { createMockEngine } from "paperclip/lib/test/utils";
// import { IntermediateCompiler } from "..";

// /*

// TODOs:

// - import module
// - dynamic attributes on non-components
// - filter out imports
// */

// [
//   [
//     `It can compile a simple PC template`,
//     {
//       "/entry.pc": `
//         <div export component as="Test">
//         </div>
//       `
//     },
//     {
//       imports: [],
//       components: [
//         {
//           tagName: "div",
//           as: "Test",
//           exported: true,
//           range: {
//             start: {
//               pos: 9,
//               line: 2,
//               column: 9
//             },
//             end: {
//               pos: 56,
//               line: 3,
//               column: 15
//             }
//           },
//           scopeClassNames: ["_406d2856", "_80f4925f", "_pub-80f4925f"],
//           kind: "Component",
//           attributes: [],
//           children: []
//         }
//       ],
//       css: {
//         sheetText: "",
//         exports: null
//       },
//       assets: []
//     }
//   ],
//   [
//     `Translates static attributes`,
//     {
//       "/entry.pc": `
//         <div export component as="Test" a="b">
//         </div>
//       `
//     },
//     {
//       imports: [],
//       components: [
//         {
//           tagName: "div",
//           as: "Test",
//           exported: true,
//           scopeClassNames: ["_406d2856", "_80f4925f", "_pub-80f4925f"],

//           range: {
//             start: {
//               pos: 9,
//               line: 2,
//               column: 9
//             },
//             end: {
//               pos: 62,
//               line: 3,
//               column: 15
//             }
//           },
//           kind: "Component",
//           attributes: [
//             {
//               name: "a",
//               variants: [
//                 {
//                   parts: [
//                     {
//                       kind: "Static",
//                       value: "b",
//                       range: {
//                         start: {
//                           pos: 44,
//                           line: 2,
//                           column: 44
//                         },
//                         end: {
//                           pos: 45,
//                           line: 2,
//                           column: 45
//                         }
//                       }
//                     }
//                   ],
//                   range: {
//                     start: {
//                       pos: 41,
//                       line: 2,
//                       column: 41
//                     },
//                     end: {
//                       pos: 46,
//                       line: 2,
//                       column: 46
//                     }
//                   },
//                   variantName: null
//                 }
//               ]
//             }
//           ],
//           children: []
//         }
//       ],
//       css: {
//         sheetText: "",
//         exports: null
//       },
//       assets: []
//     }
//   ],
//   [
//     `Translates variant attributes`,
//     {
//       "/entry.pc": `
//         <div export component as="Test" a:b="c">
//         </div>
//       `
//     },

//     {
//       imports: [],
//       components: [
//         {
//           tagName: "div",
//           as: "Test",
//           exported: true,
//           scopeClassNames: ["_406d2856", "_80f4925f", "_pub-80f4925f"],
//           range: {
//             start: {
//               pos: 9,
//               line: 2,
//               column: 9
//             },
//             end: {
//               pos: 64,
//               line: 3,
//               column: 15
//             }
//           },
//           kind: "Component",
//           attributes: [
//             {
//               name: "a",
//               variants: [
//                 {
//                   range: {
//                     start: {
//                       pos: 41,
//                       line: 2,
//                       column: 41
//                     },
//                     end: {
//                       pos: 48,
//                       line: 2,
//                       column: 48
//                     }
//                   },
//                   variantName: "b",
//                   parts: [
//                     {
//                       kind: "Static",
//                       value: "c",
//                       range: {
//                         start: {
//                           pos: 46,
//                           line: 2,
//                           column: 46
//                         },
//                         end: {
//                           pos: 47,
//                           line: 2,
//                           column: 47
//                         }
//                       }
//                     }
//                   ]
//                 }
//               ]
//             }
//           ],
//           children: []
//         }
//       ],
//       css: {
//         sheetText: "",
//         exports: null
//       },
//       assets: []
//     }
//   ],
//   [
//     `If attributes same the same variant name, the first one will be overridden`,
//     {
//       "/entry.pc": `
//         <div export component as="Test" a="a" a="b" a:b="c" a:b="c2">
//         </div>
//       `
//     },
//     {
//       imports: [],
//       components: [
//         {
//           tagName: "div",
//           as: "Test",
//           scopeClassNames: ["_406d2856", "_80f4925f", "_pub-80f4925f"],

//           exported: true,
//           range: {
//             start: {
//               pos: 9,
//               line: 2,
//               column: 9
//             },
//             end: {
//               pos: 85,
//               line: 3,
//               column: 15
//             }
//           },
//           kind: "Component",
//           attributes: [
//             {
//               name: "a",
//               variants: [
//                 {
//                   range: {
//                     start: {
//                       pos: 47,
//                       line: 2,
//                       column: 47
//                     },
//                     end: {
//                       pos: 52,
//                       line: 2,
//                       column: 52
//                     }
//                   },
//                   variantName: null,
//                   parts: [
//                     {
//                       kind: "Static",
//                       value: "b",
//                       range: {
//                         start: {
//                           pos: 50,
//                           line: 2,
//                           column: 50
//                         },
//                         end: {
//                           pos: 51,
//                           line: 2,
//                           column: 51
//                         }
//                       }
//                     }
//                   ]
//                 },
//                 {
//                   range: {
//                     start: {
//                       pos: 61,
//                       line: 2,
//                       column: 61
//                     },
//                     end: {
//                       pos: 69,
//                       line: 2,
//                       column: 69
//                     }
//                   },
//                   variantName: "b",
//                   parts: [
//                     {
//                       kind: "Static",
//                       value: "c2",
//                       range: {
//                         start: {
//                           pos: 66,
//                           line: 2,
//                           column: 66
//                         },
//                         end: {
//                           pos: 68,
//                           line: 2,
//                           column: 68
//                         }
//                       }
//                     }
//                   ]
//                 }
//               ]
//             }
//           ],
//           children: []
//         }
//       ],
//       css: {
//         sheetText: "",
//         exports: null
//       },
//       assets: []
//     }
//   ],
//   [
//     `Can translate various script nodes`,
//     {
//       "/entry.pc": `
//         <div export component as="Test">
//           {a || b && c? || true || "blah" || -100 || !100 || <div /> }
//         </div>
//       `
//     },
//     {
//       imports: [],
//       components: [
//         {
//           tagName: "div",
//           as: "Test",
//           exported: true,
//           range: {
//             start: {
//               pos: 9,
//               line: 2,
//               column: 9
//             },
//             end: {
//               pos: 127,
//               line: 4,
//               column: 15
//             }
//           },
//           kind: "Component",
//           scopeClassNames: ["_406d2856", "_80f4925f", "_pub-80f4925f"],
//           attributes: [],
//           children: [
//             {
//               kind: "Slot",
//               script: {
//                 kind: "Conjunction",
//                 operator: "Or",
//                 left: {
//                   kind: "Reference",
//                   name: "a",
//                   optional: false,
//                   range: {
//                     start: {
//                       pos: 53,
//                       line: 3,
//                       column: 12
//                     },
//                     end: {
//                       pos: 54,
//                       line: 3,
//                       column: 13
//                     }
//                   }
//                 },
//                 right: {
//                   kind: "Conjunction",
//                   operator: "And",
//                   left: {
//                     kind: "Reference",
//                     name: "b",
//                     optional: false,
//                     range: {
//                       start: {
//                         pos: 58,
//                         line: 3,
//                         column: 17
//                       },
//                       end: {
//                         pos: 59,
//                         line: 3,
//                         column: 18
//                       }
//                     }
//                   },
//                   right: {
//                     kind: "Conjunction",
//                     operator: "Or",
//                     left: {
//                       kind: "Reference",
//                       name: "c",
//                       optional: true,
//                       range: {
//                         start: {
//                           pos: 63,
//                           line: 3,
//                           column: 22
//                         },
//                         end: {
//                           pos: 65,
//                           line: 3,
//                           column: 24
//                         }
//                       }
//                     },
//                     right: {
//                       kind: "Conjunction",
//                       operator: "Or",
//                       left: {
//                         kind: "Boolean",
//                         value: true,
//                         range: {
//                           start: {
//                             pos: 69,
//                             line: 3,
//                             column: 28
//                           },
//                           end: {
//                             pos: 73,
//                             line: 3,
//                             column: 32
//                           }
//                         }
//                       },
//                       right: {
//                         kind: "Conjunction",
//                         operator: "Or",
//                         left: {
//                           kind: "String",
//                           value: "blah",
//                           range: {
//                             start: {
//                               pos: 77,
//                               line: 3,
//                               column: 36
//                             },
//                             end: {
//                               pos: 83,
//                               line: 3,
//                               column: 42
//                             }
//                           }
//                         },
//                         right: {
//                           kind: "Conjunction",
//                           operator: "Or",
//                           left: {
//                             kind: "Number",
//                             value: "-100",
//                             range: {
//                               start: {
//                                 pos: 87,
//                                 line: 3,
//                                 column: 46
//                               },
//                               end: {
//                                 pos: 91,
//                                 line: 3,
//                                 column: 50
//                               }
//                             }
//                           },
//                           right: {
//                             kind: "Conjunction",
//                             operator: "Or",
//                             left: {
//                               kind: "Not",
//                               expression: {
//                                 kind: "Number",
//                                 value: "100",
//                                 range: {
//                                   start: {
//                                     pos: 96,
//                                     line: 3,
//                                     column: 55
//                                   },
//                                   end: {
//                                     pos: 99,
//                                     line: 3,
//                                     column: 58
//                                   }
//                                 }
//                               },
//                               range: {
//                                 start: {
//                                   pos: 95,
//                                   line: 3,
//                                   column: 54
//                                 },
//                                 end: {
//                                   pos: 96,
//                                   line: 3,
//                                   column: 55
//                                 }
//                               }
//                             },
//                             right: {
//                               kind: "Element",
//                               element: {
//                                 kind: "Element",
//                                 tagName: "div",
//                                 attributes: [],
//                                 scopeClassNames: [
//                                   "_3024ebf3",
//                                   "_80f4925f",
//                                   "_pub-80f4925f"
//                                 ],
//                                 range: {
//                                   start: {
//                                     pos: 103,
//                                     line: 3,
//                                     column: 62
//                                   },
//                                   end: {
//                                     pos: 110,
//                                     line: 3,
//                                     column: 69
//                                   }
//                                 },
//                                 children: []
//                               },
//                               range: {
//                                 start: {
//                                   pos: 103,
//                                   line: 3,
//                                   column: 62
//                                 },
//                                 end: {
//                                   pos: 110,
//                                   line: 3,
//                                   column: 69
//                                 }
//                               }
//                             },
//                             range: {
//                               start: {
//                                 pos: 95,
//                                 line: 3,
//                                 column: 54
//                               },
//                               end: {
//                                 pos: 110,
//                                 line: 3,
//                                 column: 69
//                               }
//                             }
//                           },
//                           range: {
//                             start: {
//                               pos: 87,
//                               line: 3,
//                               column: 46
//                             },
//                             end: {
//                               pos: 110,
//                               line: 3,
//                               column: 69
//                             }
//                           }
//                         },
//                         range: {
//                           start: {
//                             pos: 77,
//                             line: 3,
//                             column: 36
//                           },
//                           end: {
//                             pos: 110,
//                             line: 3,
//                             column: 69
//                           }
//                         }
//                       },
//                       range: {
//                         start: {
//                           pos: 69,
//                           line: 3,
//                           column: 28
//                         },
//                         end: {
//                           pos: 110,
//                           line: 3,
//                           column: 69
//                         }
//                       }
//                     },
//                     range: {
//                       start: {
//                         pos: 63,
//                         line: 3,
//                         column: 22
//                       },
//                       end: {
//                         pos: 110,
//                         line: 3,
//                         column: 69
//                       }
//                     }
//                   },
//                   range: {
//                     start: {
//                       pos: 58,
//                       line: 3,
//                       column: 17
//                     },
//                     end: {
//                       pos: 110,
//                       line: 3,
//                       column: 69
//                     }
//                   }
//                 },
//                 range: {
//                   start: {
//                     pos: 53,
//                     line: 3,
//                     column: 12
//                   },
//                   end: {
//                     pos: 110,
//                     line: 3,
//                     column: 69
//                   }
//                 }
//               },
//               range: {
//                 start: {
//                   pos: 52,
//                   line: 3,
//                   column: 11
//                 },
//                 end: {
//                   pos: 112,
//                   line: 3,
//                   column: 71
//                 }
//               }
//             }
//           ]
//         }
//       ],
//       css: {
//         sheetText: "",
//         exports: null
//       },
//       assets: []
//     }
//   ]
// ].forEach(([title, source, output]: any) => {
//   it(title, () => {
//     const engine: EngineDelegate = createMockEngine(source);
//     const compiler = new IntermediateCompiler(engine);
//     const module = compiler.parseFile("/entry.pc");
//     // console.log(JSON.stringify(module, null, 2));
//     expect(module).to.be.eql(output);
//   });
// });
