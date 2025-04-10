
const displayInput = document.querySelector(".display-inp");
const calcBody = document.querySelector(".calc-body");
const history = document.querySelector(".history");
const logBtn = document.querySelector("#log");
const sqrtBtn = document.querySelector("#sqrt");
const parentDiv = document.createElement('div');
parentDiv.classList.add(`history-parent`);
history.appendChild(parentDiv);
let userInput;
let result;
let clearOperator = [`C`, `⌫`];
const operations = [`+`, `-`, `×`, `÷`, `%`, `^`, `(`, `)`, `mod`, 'n', `√`, '.'];
// 3×2+5-4÷3+2+1×2-3
const precedence = {
  "-": 1,
  "+": 1,
  "÷": 2,
  "×": 2,
  "(": 4,
}

// to separate each number alone and then we will put it in array of index
const regExp = /(\d+(\.\d+)?|\+|\-|\×|\÷|\(|\)|(mod)|(log)|(\^))/g;
let arithmeticOperation = [];

let stack = [];
let queue = [];

calcBody.addEventListener("click", (e) => {

  if (e.target.tagName === `BUTTON`) {

    userInput = e.target.textContent;

    // check if User Input is Number or point or ( )
    if (isNumericInput(userInput) || isOperator(userInput)) {
      appendIfNumeric(userInput);   //to display user input at input
    }
    // check if User Input is operation

    else if (userInput === `=`) {
      arithmeticOperation = displayInput.value.match(regExp);
      for(let i = 0; i < arithmeticOperation.length; i++) {
        if(arithmeticOperation[i].includes(operations)){
          
        }
      }
      let infixArr = infix(arithmeticOperation);
      result = postfix(infixArr);
      addEleToHistory(displayInput.value, result);
      displayInput.value = result;   // Put the result here
      newArithmeticOperation();
    }
    else if(userInput === `C`) reset();
    else if(userInput === `⌫`) removeLastDigit();
    else if(userInput === "log") logFun();
    else if(userInput === "sqrt") sqrtFun();
    // else if(userInput === "X²") powerFun();

  }
})


// -------------- stackCheck -------------------
function stackCheck(stack, queue, ele) {
  if (stack.length === 0) stack.push(ele);
  else {
    if (precedence[ele] > precedence[stack[stack.length - 1]]) {
      stack.push(ele);
    } else if (precedence[ele] == precedence[stack[stack.length - 1]]) {
      if (isNotParenthesis(stack)) {
        queue.push(stack[stack.length - 1]);
      }
      stack.pop();
      stack.push(ele);
    } else if (precedence[ele] < precedence[stack[stack.length - 1]]) {

      if (isNotParenthesis(stack)) {
        queue.push(stack[stack.length - 1]);
      }
      stack.pop();
      stack.push(ele);
    }
  }
  if (stack.length == 2 &&
    precedence[ele] == precedence[stack[0]]) {
    if (isNotParenthesis(stack)) {
      queue.push(stack[0]);
    }
    stack.shift();
  }
}


// -------------- infix -------------------
function infix(arithmeticOperation) {
  console.log("arith is: " + arithmeticOperation); 

  for(let ele = 0; ele < arithmeticOperation.length; ele++) {
  
     if (arithmeticOperation[ele] == `)`) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i] == `(`) {
          stack.pop();
          break;
        } else queue.push(stack.pop());
      }
    } 
        
    else if (isOperator(arithmeticOperation[ele])) {
      if(ele === 0 || isPreviousEleOperator(arithmeticOperation, ele)) {
        arithmeticOperation[ele + 1] = Number(arithmeticOperation[ele] +arithmeticOperation[ele+1]);
        continue;
      } else if(areInvalidInputs(arithmeticOperation , ele) ){
          displayInput.value += `\t Malformed expression!`;
      }


      else {
      stackCheck(stack, queue, arithmeticOperation[ele]);
      }
    } 
    
    
    else if (isNumericInput(arithmeticOperation[ele])) {
      queue.push(arithmeticOperation[ele]);
    }
  }

  if (stack.length !== 0) {
    for (let i = 0; stack.length > 0; i++) queue.push(stack.pop());
  }
  return queue;
}

// -------------- postfix -------------------
function postfix(infixArr) {
  const stack = [];
  infixArr.forEach(ele => {
    if (!isNaN(ele)) stack.push(Number(ele));
    else {    
      let secondOperand = stack.pop();
      let firstOperand = stack.pop();
      let operation = ele;
      let result;

      if(!isNaN(secondOperand) && !isNaN(firstOperand)) {
        switch (operation) {
          case `+`: result = firstOperand + secondOperand; break;
          case `-`: result = firstOperand - secondOperand; break;
          case `×`: result = firstOperand * secondOperand; break;
          case `÷`: result = firstOperand / secondOperand; break;
          case `mod`: result = firstOperand % secondOperand; break;
          case `^`: result = Math.pow(firstOperand, secondOperand); break;
        }
      } 
      if(isNaN(secondOperand) || isNaN(firstOperand)) {
        result = displayInput.value;  }   
        
      stack.push(result);
    }
  });
  return stack[0];
}


function addEleToHistory(text, result) {
 
  let div1 = document.createElement('div');
  let pStart = document.createElement('p');
  let pMid = document.createElement('p');
  let pEnd = document.createElement('p');

  pStart.textContent = text ;
  pMid.textContent = `  =  `;
  pEnd.textContent = result;

  
  div1.appendChild(pStart);
  div1.appendChild(pMid);
  div1.appendChild(pEnd);
  parentDiv.appendChild(div1);

}


function isNotParenthesis(stack) {
  return stack[stack.length - 1] !== `(`;
}

function logFun() {
  const value = parseFloat(displayInput.value);
  displayInput.value = Math.log10(value);
}

function sqrtFun() {
  const value = parseFloat(displayInput.value);
  displayInput.value = Math.sqrt(value);
}

function powerFun() {
  const value = parseFloat(displayInput.value);
  displayInput.value = Math.p(value);
}


function newArithmeticOperation() {
  userInput = null;
  result = null;
  arithmeticOperation = null;
   stack = [];
   queue = [];
}
function reset(){
  userInput = null;
  result = null;
  arithmeticOperation = null;
  displayInput.value= null;
   stack = [];
   queue = [];
}

function removeLastDigit() {
  displayInput.value = displayInput.value.slice(0, -1);
}

function isNumericInput(userInput) {
  return !isNaN(userInput);
}

function appendIfNumeric(userInput) {
  if(userInput === `.`) {
    if(displayInput.value.match(/\./g) === null) {
      displayInput.value += userInput;
    }
    return displayInput.value;
  } 
 else displayInput.value += userInput;
}

function isOperator(userInput) {
  return operations.includes(userInput);

}


function isPreviousEleOperator(arithmeticOperation , ele) {
  return isOperator(arithmeticOperation[ele - 1]); 
}
function isNextEleOperator(arithmeticOperation , ele) {
  return isOperator(arithmeticOperation[ele + 1]); 
}
function isNextToNextEleOperator(arithmeticOperation , ele) {
  return isOperator(arithmeticOperation[ele + 2]); 
}

function areInvalidInputs(arithmeticOperation, ele) {
  return      isNextEleOperator(arithmeticOperation , ele) &&
             isNextToNextEleOperator(arithmeticOperation , ele) 

}