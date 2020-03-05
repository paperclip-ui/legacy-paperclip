import React, { useReducer, Dispatch } from "react";
import {Calculator} from "./app.pc";

type State = {
  value: number,
  displayValue: number,
  currentOperator: string | null
};

const INITIAL_STATE: State = {
  value: 0,
  displayValue: 0,
  currentOperator: null
};

enum Action {
  AC_CLICKED,
  PLUS_MINUS_CLICKED,
  PERCENT_CLICKED,
  DIVIDE_CLICKED,
  SEVEN_CLICKED,
  EIGHT_CLICKED,
  NINE_CLICKED,
  TIMES_CLICKED,
  FOUR_CLICKED,
  FIVE_CLICKED,
  SIX_CLICKED,
  MINUS_CLICKED,
  ONE_CLICKED,
  TWO_CLICKED,
  THREE_CLICKED,
  PLUS_CLICKED,
  ZERO_CLICKED,
  DOT_CLICKED,
  EQUALS_CLICKED
};

const addDisplayValue = (value: number, state: State) => ({
  ...state,
  displayValue: state.currentOperator === "=" ? 0 : Number(String(state.displayValue) + value),
  currentOperator: state.currentOperator === "=" ? null : state.currentOperator
});

const setOperator = (operator: string, state: State) => ({
  ...state,
  value: state.displayValue,
  displayValue: 0,
  currentOperator: operator
});

const negateDisplay = (state: State) => ({
  ...state,
  displayValue: -state.displayValue
});

const clear = (state: State): State => ({
  ...state,
  value: 0,
  displayValue: 0,
  currentOperator: null,
});

const calculate = (state: State): State => {
  let value = state.value;


  switch (state.currentOperator) {
    case "+": {
      value += state.displayValue;
      break;
    }
    case "-": {
      value -= state.displayValue;
      break;
    }
    case "/": {
      value /= state.displayValue;
      break;
    }
    case "x": {
      value *= state.displayValue;
      break;
    }
    case "%": {
      value %= state.displayValue;
      break;
    }
  }

  return {
    ...state,
    displayValue: value,
    currentOperator: "="
  }
};

const reducer = (state: State, action: Action) => {
  switch(action) {
    case Action.AC_CLICKED: return clear(state);
    case Action.PLUS_MINUS_CLICKED: return negateDisplay(state);
    case Action.DIVIDE_CLICKED: return setOperator("/", state);
    case Action.TIMES_CLICKED: return setOperator("x", state);
    case Action.MINUS_CLICKED: return setOperator("-", state);
    case Action.PLUS_CLICKED: return setOperator("+", state);
    case Action.ZERO_CLICKED: return addDisplayValue(0, state);
    case Action.ONE_CLICKED: return addDisplayValue(1, state);
    case Action.TWO_CLICKED: return addDisplayValue(2, state);
    case Action.THREE_CLICKED: return addDisplayValue(3, state);
    case Action.FOUR_CLICKED: return addDisplayValue(4, state);
    case Action.FIVE_CLICKED: return addDisplayValue(5, state);
    case Action.SIX_CLICKED: return addDisplayValue(6, state);
    case Action.SEVEN_CLICKED: return addDisplayValue(7, state);
    case Action.EIGHT_CLICKED: return addDisplayValue(8, state);
    case Action.NINE_CLICKED: return addDisplayValue(9, state);
    case Action.EQUALS_CLICKED: return calculate(state);


  }
  return state;
};

export function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  
  return <Calculator 
    value={state.displayValue} 
    onACClick={eventDispatcher(Action.AC_CLICKED, dispatch)} 
    onNegateClick={eventDispatcher(Action.PLUS_MINUS_CLICKED, dispatch)} 
    onPercentClick={eventDispatcher(Action.PERCENT_CLICKED, dispatch)} 
    onDivideClick={eventDispatcher(Action.DIVIDE_CLICKED, dispatch)}
    onSevenClick={eventDispatcher(Action.SEVEN_CLICKED, dispatch)} 
    onEightClick={eventDispatcher(Action.EIGHT_CLICKED, dispatch)} 
    onNineClick={eventDispatcher(Action.NINE_CLICKED, dispatch)} 
    onXClick={eventDispatcher(Action.TIMES_CLICKED, dispatch)} 
    onFourClick={eventDispatcher(Action.FOUR_CLICKED, dispatch)} 
    onFiveClick={eventDispatcher(Action.FIVE_CLICKED, dispatch)} 
    onSixClick={eventDispatcher(Action.SIX_CLICKED, dispatch)} 
    onMinusClick={eventDispatcher(Action.MINUS_CLICKED, dispatch)} 
    onOneClick={eventDispatcher(Action.ONE_CLICKED, dispatch)} 
    onTwoClick={eventDispatcher(Action.TWO_CLICKED, dispatch)} 
    onThreeClick={eventDispatcher(Action.THREE_CLICKED, dispatch)} 
    onPlusClick={eventDispatcher(Action.PLUS_CLICKED, dispatch)} 
    onZeroClick={eventDispatcher(Action.ZERO_CLICKED, dispatch)} 
    onDotClick={eventDispatcher(Action.DOT_CLICKED, dispatch)} 
    onEqualsClick={eventDispatcher(Action.EQUALS_CLICKED, dispatch)} 
  />;
};

const eventDispatcher = (action: Action, dispatch: Dispatch<Action>) => () => dispatch(action);