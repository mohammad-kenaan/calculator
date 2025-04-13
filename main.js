
const displayInput = document.querySelector(".display-inp");
const clearAll = document.querySelector("#clear-all");
const calcBody = document.querySelector(".calc-body");
const history = document.querySelector(".history");
const logBtn = document.querySelector("#log");
const sqrtBtn = document.querySelector("#sqrt");
const parentDiv = document.createElement('div');
parentDiv.classList.add(`history-parent`);
history.appendChild(parentDiv);
let userInput;
let result;
let typeOfError = '';
let clearOperator = [`C`, `⌫`];
const operations = [`+`, `-`, `×`, `÷`, `%`, `^`, `(`, `)`, 'n', '.'];
const precedence = {
  "-": 1,
  "+": 1,
  "÷": 2,
  "×": 2,
  "%": 2,
  "^": 3,
  "(": 4,
}

let arithmeticOperation = [];
// const regExp = /(\d+(\.\d+)?(\.+)?|\+|\-|\*|\/|\×|\÷|\(|\)|(\^))/g;
const regExp = /((\d*\.\d+|\d+\.\d*|\d+)|\+|\-|\*|\/|\×|\÷|\(|\)|(\^)|(\%))/g;
const checkDot = /(\.\.{2,})|(\.\d\.)|(\d\.{2,})/;
const checkOperator = /(\×{2,})|(\×\÷)|(\÷\×)|(\÷{2,})/;


calcBody.addEventListener("click", (e) => {
  if (e.target.tagName === `BUTTON`) {
    userInput = e.target.textContent;
    // check if User Input is Number or point or ( )
    if (isNumericInput(userInput) || isOperator(userInput)) {
      appendIfNumeric(userInput);   //to display user input at input
    }
    // Start Process 
    else if (userInput === `=`) {

      arithmeticOperation = expressionInArray(displayInput.value,
        checkOperator, checkDot, regExp);
      if (arithmeticOperation.length === 0) {
        displayInput.value += "\t " + typeOfError;
      } else {
        let infixArr = infix(arithmeticOperation);
        result = postfix(infixArr);
        addEleToHistory(displayInput.value, result);
        displayInput.value = result;   // Put the result here
        newArithmeticOperation();
      }
    }
    else if (userInput === `C`) reset();
    else if (userInput === `⌫`) removeLastDigit();
    else if (userInput === "log") logFun();
    else if (userInput === "√") sqrtFun(displayInput.value);
    else if (userInput === "AC") clearAllFun(displayInput.value);
  }
})
// -------------- infix -------------------
function infix(input) {
  // Check Negative Num [-,5,+,-,5,-,3] convert it to => [-5,+,-5,-,3]
  let tempArithmeticOperationN = checkNegativeNum(input);
  let tempArithmeticOperation = checkPositiveNum(tempArithmeticOperationN);
  // if the input was [5,(,5,),3,+(4)] convert it to => [5,*,(,5,),*,3,+,(,4,)] 
  let arithmeticOperation = addMultiplication(tempArithmeticOperation);
  let stack = [];
  let queue = [];
  for (let ele = 0; ele < arithmeticOperation.length; ele++) {
    if (arithmeticOperation[ele] === `(`) {
      stack.push(arithmeticOperation[ele]);
    }
    else if (arithmeticOperation[ele] === `)`) {
      while (stack.length > 0 && stack[stack.length - 1] !== `(`) {
        let operatorPopFromStack = stack.pop();
        queue.push(operatorPopFromStack)
      }
      if (stack.length > 0 && stack[stack.length - 1] === `(`) {
        stack.pop();
      }
    }
    else if (isNumericInput(arithmeticOperation[ele])) {
      queue.push(arithmeticOperation[ele]);
    }
    else if (isOperator(arithmeticOperation[ele])) {
      while (stack.length > 0 &&
        isOperator(stack[stack.length - 1]) &&
        stack[stack.length - 1] !== `(` &&
        precedence[arithmeticOperation[ele]] <=
        precedence[stack[stack.length - 1]]
      ) {
        let operatorPopIt = stack.pop();
        queue.push(operatorPopIt);
      }
      stack.push(arithmeticOperation[ele]);
    }
  }
  while (stack.length > 0) {
    queue.push(stack.pop());
  }
  return queue;
}

// -------------- postfix -------------------
function postfix(infixArr) {
  const stack = [];
  let result;
  for (const ele of infixArr) {
    if (isNumericInput(ele)) {
      stack.push(parseFloat(ele));
    }
    else if (isOperator(ele)) {
      let operator = ele;
      const secondOperand = stack.pop();
      const firstOperand = stack.pop();
      switch (operator) {
        case `+`: result = firstOperand + secondOperand; break;
        case `-`: result = firstOperand - secondOperand; break;
        case `×`: result = firstOperand * secondOperand; break;
        case `÷`: result = firstOperand / secondOperand; break;
        case `%`: result = firstOperand % secondOperand; break;
        case `^`: result = Math.pow(firstOperand, secondOperand); break;
      }

      stack.push(result);
      console.log(firstOperand + operator + secondOperand);
    }
  }
   return stack[0];
}



function expressionInArray(displayInput, checkOperator, checkDot,
  regExp) {
  // Remove space
  expression = displayInput.replace(/\s+/g, '');
  // Abort the process if the input has repeated dots

  if (isFirstIndexDivisionOrMultiplication(displayInput)) {
    typeOfError = `\tError   
    - Expressions cannot start with an operator`;
    return [];
  }
  if (isLastIndexDivisionOrMultiplication(displayInput)) {
    typeOfError = `\tError  
     - Expressions cannot end with an operator`;
    return [];
  }

  if (checkDot.test(expression)) {
    typeOfError = `\tError  
    - Multiple decimal points
     detected in a single number`;
    return [];
  }
  if (checkOperator.test(expression)) {
    typeOfError = `\tError  
     - Consecutive multiplication-division
      operators detected`;
    return [];
  }
  if (hasMultiOperators(expression)) {
    typeOfError = ` \tError 
    - Invalid operator sequence detected`;
    return [];
  }

  expression = expression.match(regExp) || [];
  // to separate number operators and parentheses then put it in array of index
  return expression;
}

function addEleToHistory(text, result) {
  let div1 = document.createElement('div');
  let pStart = document.createElement('p');
  let pMid = document.createElement('p');
  let pEnd = document.createElement('p');
  pStart.textContent = text;
  pMid.textContent = `  =  `;
  pEnd.textContent = result;
  div1.appendChild(pStart);
  div1.appendChild(pMid);
  div1.appendChild(pEnd);
  parentDiv.appendChild(div1);
}

function logFun() {
  const value = parseFloat(displayInput.value);
  displayInput.value = Math.log10(value);
}

function sqrtFun(num) {
  const value = parseFloat(num);
  displayInput.value = Math.sqrt(value);
}

function newArithmeticOperation() {
  userInput = null;
  result = null;
  arithmeticOperation = null;
  stack = [];
  queue = [];
}

function reset() {
  userInput = null;
  result = null;
  arithmeticOperation = null;
  displayInput.value = null;
  stack = [];
  queue = [];
}

function removeLastDigit() {
  displayInput.value = displayInput.value.slice(0, -1);
}

function isNumericInput(num) {
  return !isNaN(parseFloat(num));
}

function appendIfNumeric(userInput) {
  displayInput.value += userInput;
}

function isOperator(operator) {
  return operations.includes(operator);
}

function isPreviousEleOperator(arr, ele) {
  return isOperator(arr[ele - 1]);
}
function isNextEleOperator(arr, ele) {
  return isOperator(arr[ele + 1]);
}

function hasMultiOperators(input) {
  const operatorsList = [`+`, `-`, `×`, `÷`];
  for (let i = 0; i < input.length; i++) {
    if (operatorsList.includes(input[i])) {
      if (operatorsList.includes(input[i + 1])) {
        if (operatorsList.includes(input[i + 2])) {
          return true;
        }
      }
    }
  }
  return false;
}


function checkNegativeNum(input) {
  if (input.includes(`-`)) {
    for (let i = 0; i < input.length; i++) {
      if (input[i] === `-` && isNumericInput(input[i + 1])) {
        if (i === 0) {
          let temp = input.shift();
          input[i] = temp + input[i];
          continue;
        }
        else if (i > 0 && isPreviousEleOperator(input, i)) {
          input[i + 1] = `-` + input[i + 1]
          input.splice(i, 1);
          continue;
        }
      }
    }
  }
  return input;
}

function checkPositiveNum(input) {
  if (input.includes(`+`)) {
    for (let i = 0; i < input.length; i++) {
      if (input[i] === `+` && isNumericInput(input[i + 1])) {
        if (i === 0) {
          let temp = input.shift();
          input[i] = temp + input[i];
          continue;
        }
        else if (i > 0 && isPreviousEleOperator(input, i)) {
          input[i + 1] = `+` + input[i + 1]
          input.splice(i, 1);
          continue;
        }
      }
    }
  }
  return input;
}

function addMultiplication(input) {
  if (input.includes(`(`)) {
    for (let i = 0; i < input.length; i++) {
      if (input[i] === `(`) {
        if (i > 0 && !isPreviousEleOperator(input, i)) {
          input.splice(i, 0, `×`);
          i++;
          continue;
        }
      }
      else if (input[i] === `)`)
        if (i !== input.length - 1 && !isNextEleOperator(input, i)) {
          input.splice(i + 1, 0, `×`);
          i++;
          continue;
        }
    }
  }
  return input;
}

function isFirstIndexDivisionOrMultiplication(input) {
  if (input[0] === `×`) return true;
  if (input[0] === `÷`) return true;
  return false;

}
function isLastIndexDivisionOrMultiplication(input) {
  if (isEndWithOperator(input[input.length - 1])) return true;
  return false;

} 

function clearAllFun(displayInput) {
  reset();
  parentDiv.textContent ="";
}

function isEndWithOperator(operator) {
  let op = [`+`, `-`, `×`, `÷`, `%`];
  return op.includes(operator);
}