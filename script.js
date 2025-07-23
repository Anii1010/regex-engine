function toPostfix(regex) {
  let precedence = { '*': 3, '.': 2, '|': 1 };
  let output = "", stack = [];

  
  let formatted = "";
  for (let i = 0; i < regex.length; i++) {
    formatted += regex[i];
    if (i < regex.length - 1 && /[a-z0-9)]/.test(regex[i]) && /[a-z0-9(]/.test(regex[i + 1])) {
      formatted += '.';
    }
  }

  for (let c of formatted) {
    if (/[a-z0-9]/.test(c)) {
      output += c;
    } else if (c === '(') {
      stack.push(c);
    } else if (c === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') output += stack.pop();
      stack.pop();
    } else {
      while (stack.length && precedence[stack[stack.length - 1]] >= precedence[c]) {
        output += stack.pop();
      }
      stack.push(c);
    }
  }
  while (stack.length) output += stack.pop();
  return output;
}

let stateId = 0;
function newState() {
  return { id: stateId++, transitions: {} };
}
function addTransition(from, symbol, to) {
  if (!from.transitions[symbol]) from.transitions[symbol] = [];
  from.transitions[symbol].push(to);
}

function postfixToNFA(postfix) {
  let stack = [];

  for (let token of postfix) {
    if (/[a-z0-9]/.test(token)) {
      let start = newState(), end = newState();
      addTransition(start, token, end);
      stack.push({ start, end });
    } else if (token === '.') {
      let b = stack.pop(), a = stack.pop();
      addTransition(a.end, 'ε', b.start);
      stack.push({ start: a.start, end: b.end });
    } else if (token === '|') {
      let b = stack.pop(), a = stack.pop();
      let start = newState(), end = newState();
      addTransition(start, 'ε', a.start);
      addTransition(start, 'ε', b.start);
      addTransition(a.end, 'ε', end);
      addTransition(b.end, 'ε', end);
      stack.push({ start, end });
    } else if (token === '*') {
      let a = stack.pop();
      let start = newState(), end = newState();
      addTransition(start, 'ε', a.start);
      addTransition(start, 'ε', end);
      addTransition(a.end, 'ε', a.start);
      addTransition(a.end, 'ε', end);
      stack.push({ start, end });
    }
  }
  return stack.pop();
}

function epsilonClosure(states) {
  let stack = [...states];
  let closure = new Set(states);

  while (stack.length) {
    let state = stack.pop();
    let trans = state.transitions['ε'] || [];
    for (let next of trans) {
      if (!closure.has(next)) {
        closure.add(next);
        stack.push(next);
      }
    }
  }
  return closure;
}

function simulateNFA(nfa, input) {
  let currentStates = epsilonClosure([nfa.start]);

  for (let symbol of input) {
    let nextStates = new Set();
    for (let state of currentStates) {
      let trans = state.transitions[symbol] || [];
      for (let next of trans) {
        nextStates.add(next);
      }
    }
    currentStates = epsilonClosure([...nextStates]);
  }
  return currentStates.has(nfa.end);
}

function run() {
  stateId = 0;
  const regex = document.getElementById("regex").value;
  const input = document.getElementById("teststr").value;
  const postfix = toPostfix(regex);
  const nfa = postfixToNFA(postfix);
  const result = simulateNFA(nfa, input);
  document.getElementById("result").innerText = result ? "✅ String Accepted" : "❌ String Rejected";
}
