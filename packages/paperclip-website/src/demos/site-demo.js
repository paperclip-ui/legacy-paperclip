const SOURCE = `// file: Button.pc
<import src="./Preview.pc" as="Preview" />
<import src="./Colors.pc" />
<import src="./Typography.pc" as="typography" />
<import src="./Spacing.pc" as="spacing" />

<style>
  .button {
    position: relative;
    padding: 12px 32px;
    background-color: var(--color-offwhite);
    color: var(--color-white);
    border: solid 1px transparent;
    outline: transparent !important;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 1px;
    line-height: 1;
    align-items: center;
    text-align: center;
    text-decoration: none;
    transition: all 250ms;
    border-radius: 3px;
    box-sizing: border-box;
    user-select: none;
    white-space: nowrap;
    text-transform: uppercase;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:not(:disabled) {
      &:hover,
      &:focus {
        background-color: rgba(var(--rgb-white), 0.1);
        border-color: rgba(var(--rgb-white), 0.6);
      }

      &:active {
        border: solid 1px rgba(var(--rgb-white), 0.4);
        background-color: rgba(var(--rgb-white), 0.1);
      }
    }

    &-primary, &[data-primary] {
      background-color: var(--color-gold);
      color: var(--color-white);
      border: 1px solid var(--color-gold);

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &:not(:disabled) {
        &:hover,
        &:focus {
          cursor: pointer;
          background-color: var(--color-gold-dark);
          border: 1px solid var(--color-gold-dark);
          color: var(--color-white);
        }

        &:active,
        &:focus {
          cursor: pointer;
          background-color: var(--color-gold-alt);
          border: 1px solid var(--color-white);
          color: var(--color-white);
        }
      }
    }

    &-primary.button-outline {
      background-color: transparent;
      color: var(--color-gold);
      border: 1px solid var(--color-gold);

      &:not(:disabled) {
        &:hover,
        &:focus {
          cursor: pointer;
          background-color: var(--color-gold);
          border: 1px solid var(--color-gold);
          color: var(--color-white);
        }

        &:active {
          cursor: pointer;
          background-color: var(--color-gold-dark);
          border: 1px solid var(--color-gold-dark);
          color: var(--color-white);
        }
      }
    }

    /* NOTE: Use negative variation instead */
    &-danger {
      &:not(:disabled) {
        &:hover,
        &:focus {
          cursor: pointer;

          /* @apply bg-red; */
        }

        &:active {
          /* @apply bg-red;
          @apply border-white; */
        }
      }
    }

    /* Negative variant is styleguide compliant, prefer over error */
    &-negative {
      background-color: transparent;
      color: #ca3a3a;
      border: 1px solid #ca3a3a;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &:not(:disabled) {
        &:hover,
        &:focus {
          cursor: pointer;
          background-color: #db2632;
          border: 1px solid #ca3a3a;
          color: #fff;
        }

        &:active,
        &:focus {
          cursor: pointer;
          background-color: #b01c25;
          border: 1px solid #b01c25;
          color: #fff;
        }
      }
    }

    /* button sizes */
    &-large {
      padding: 16px 32px;
      font-size: 1rem;
      letter-spacing: 2px;
    }

    &-small {
      padding: 10px 24px;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }

    &-xsmall {
      padding: 6px 16px;
      font-size: 0.6875rem;
    }

    /* TODO: this dosn't work */
    & + & {
      margin-left: 8px;
    }

    &-icon > svg {
      font-size: 1.3em;
      margin: -0.15em 0 -0.15em 0;
    }
    &-preview {
      margin: 10px;
      display: inline-block;
    }

    /* Almost all buttons are uppercased */
    &-resetCase {
      text-transform: none;
    }
  }
</style>

<!-- primitives -->

<button export component as="default" {onClick?} class="button {className?}"
  class:small="button-small"
  class:xsmall="button-xsmall"
  class:medium="button-medium"
  class:large="button-large"
  class:negative="button-negative"
  class:primary="button-primary"
  class:outline="button-outline"
  class:resetCase="button-resetCase"
  {disabled?}
  data-primary={primary?}
  data-testid={testId?}
  >
  {children}
</button>


<Preview>
  <default className="$button-preview">
    Button
  </default>
  <default className="$button-preview" disabled>
    Button Disabled
  </default>

  <default className="$button-preview" negative>
    Negative
  </default>

  <default className="$button-preview" primary>
    Primary
  </default>

  <default className="$button-preview" primary outline>
    Primary outline
  </default>

  <default className="$button-preview" xsmall>
    xsmall
  </default>
  
  <default className="$button-preview" small>
    Small
  </default>


  <default className="$button-preview" medium>
    Medium
  </default>
  <default className="$button-preview" large>
    Large
  </default>
</Preview>

`;

export default SOURCE;
