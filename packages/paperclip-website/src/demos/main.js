import dedent from "dedent";

export default {
  "button.pc": dedent(`
    <import src="./button-styles.pc" as="styles">
      
    <!-- This is exported to code -->  
    <div export component as="Button"
      className=">>>styles.Button"
      className:secondary=">>>styles.Button--secondary"
      className:negate=">>>styles.Button--negate">
      {children}
    </div>
    
    <!-- This is a preview -->
    <div className=">>>styles.preview">
      <Button>
        Primary button
      </Button>
    
      <Button negate>
        Negate
      </Button>

      <Button secondary>
        Secondary Button
      </Button>
      
      <Button secondary negate>
        Secondary Negate
      </Button>
    </div>
  `),
  "button-styles.pc": dedent(`
    <!-- Styles would typically go in the same file -->
    <import src="./colors.pc">
    <import src="./typography.pc" as="typography">
    <style>
      @export {
        .Button {
          @include typography.text-default;
          border: 2px solid var(--color-grey-100);
          display: inline-block;
          border-radius: 4px;
          padding: 8px 16px;
          background: var(--color-grey-100);
          color: var(--color-grey-200);
          &--negate {
            background-color: var(--color-red-100);
            border-color: var(--color-red-100);
            color: var(--color-red-200);
          }
          &--secondary {
            background: transparent;
            color: var(--color-grey-100);
          }
          &--secondary&--negate {
            color: var(--color-red-100);
          }
        }
        
        .preview {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          .Button {
            margin-bottom: 10px;
          }
        }
      }
    </style>  
    Nothing to see here!
  `),
  "typography.pc": dedent(`
      <!-- Typography styles -->
      <import src="./colors.pc">

      <style>
        @export {
          @mixin text-default {
            font-family: sans-serif;
            color: var(--color-grey-200);
            font-size: 18px;
          }
          .text-default {
            @include text-default;
          }    
          .text-color-danger {
            color: var(--color-red-100);
          }    
        }
        .text-preview {
          margin-top: 10px;
        }
      </style>
      
      <!-- previews -->
      
      <div className="text-default text-preview">
        Default text
      </div>
      <div className="text-default text-preview text-color-danger">
        Danger text
      </div>
  `),
  "colors.pc": dedent(`
      <!-- All colors -->

      <style>
        :root {
          --color-grey-100: #999;
          --color-grey-200: #333;
          --color-red-100: #F00;
          --color-red-200: #900;
        }
        .ColorPreview {
          font-family: Helvetica;
          margin-top: 10px;
          font-size: 18px;
        }
      </style>

      <div component as="ColorPreview" className="ColorPreview" style="color: {value}">  
        {value}
      </div>

      <ColorPreview value="var(--color-grey-100)" />
      <ColorPreview value="var(--color-grey-200)" />
      <ColorPreview value="var(--color-red-100)" />
      <ColorPreview value="var(--color-red-200)" />
      
  `)
};
