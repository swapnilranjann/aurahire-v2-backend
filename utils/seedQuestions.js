import { SkillTest } from "../models/SkillTest.js";
import Question from "../models/Question.js";

// Generate questions for a tech stack
const generateQuestions = (testId, stackName, questions) => {
  return questions.map(q => ({
    test_id: testId,
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation || null,
    difficulty: q.difficulty || 'medium',
    points: q.points || 1,
  }));
};

export const seedQuestions = async () => {
  try {
    // Get all active tests
    const tests = await SkillTest.findAll({ where: { is_active: true } });
    
    if (tests.length === 0) {
      console.log("⚠️ No skill tests found. Please seed skill tests first.");
      return;
    }

    for (const test of tests) {
      const existingCount = await Question.count({ where: { test_id: test.id } });
      
      if (existingCount > 0) {
        console.log(`✅ Questions already exist for ${test.skill_name} (${existingCount} questions)`);
        continue;
      }

      let questions = [];
      const stackName = test.skill_name.toLowerCase();

      // Generate questions based on stack
      if (stackName.includes('javascript') || stackName === 'js') {
        questions = getJavaScriptQuestions(test.id);
      } else if (stackName.includes('react')) {
        questions = getReactQuestions(test.id);
      } else if (stackName.includes('python')) {
        questions = getPythonQuestions(test.id);
      } else if (stackName.includes('node')) {
        questions = getNodeJSQuestions(test.id);
      } else if (stackName.includes('java')) {
        questions = getJavaQuestions(test.id);
      } else if (stackName.includes('typescript')) {
        questions = getTypeScriptQuestions(test.id);
      } else if (stackName.includes('angular')) {
        questions = getAngularQuestions(test.id);
      } else if (stackName.includes('vue')) {
        questions = getVueQuestions(test.id);
      } else if (stackName.includes('sql')) {
        questions = getSQLQuestions(test.id);
      } else if (stackName.includes('mongodb')) {
        questions = getMongoDBQuestions(test.id);
      } else if (stackName.includes('aws')) {
        questions = getAWSQuestions(test.id);
      } else if (stackName.includes('docker')) {
        questions = getDockerQuestions(test.id);
      } else if (stackName.includes('git')) {
        questions = getGitQuestions(test.id);
      } else if (stackName.includes('html') || stackName.includes('css')) {
        questions = getHTMLCSSQuestions(test.id);
      } else if (stackName.includes('c++') || stackName.includes('cpp')) {
        questions = getCPlusPlusQuestions(test.id);
      } else {
        // Default questions
        questions = getDefaultQuestions(test.id, test.skill_name);
      }

      if (questions.length > 0) {
        // Insert in batches to avoid memory issues
        const batchSize = 100;
        for (let i = 0; i < questions.length; i += batchSize) {
          const batch = questions.slice(i, i + batchSize);
          await Question.bulkCreate(batch);
        }
        
        // Update test with question count
        await test.update({ total_questions_in_db: questions.length });
        console.log(`✅ Seeded ${questions.length} questions for ${test.skill_name}`);
      }
    }
  } catch (error) {
    console.error("❌ Error seeding questions:", error);
  }
};

// JavaScript Questions (1000+)
const getJavaScriptQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is the output of: console.log(typeof null)?",
      options: ["null", "object", "undefined", "boolean"],
      correct_answer: 1,
      explanation: "In JavaScript, typeof null returns 'object'. This is a known bug in JavaScript.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "Which method is used to add an element to the end of an array?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      correct_answer: 0,
      explanation: "push() adds one or more elements to the end of an array.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What does 'const' keyword do in JavaScript?",
      options: ["Creates a constant variable", "Creates a variable", "Creates a function", "None of the above"],
      correct_answer: 0,
      explanation: "const declares a block-scoped constant that cannot be reassigned.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is a closure in JavaScript?",
      options: ["A function inside another function", "A way to hide variables", "A function that has access to outer scope variables", "A data structure"],
      correct_answer: 2,
      explanation: "A closure is a function that has access to variables in its outer (enclosing) lexical scope.",
      difficulty: "hard",
      points: 2,
    },
    {
      question: "What is the result of: '5' + 3?",
      options: ["8", "53", "Error", "undefined"],
      correct_answer: 1,
      explanation: "JavaScript converts the number to a string and concatenates: '5' + '3' = '53'",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the difference between == and === in JavaScript?",
      options: ["No difference", "== checks value, === checks value and type", "=== is faster", "== is deprecated"],
      correct_answer: 1,
      explanation: "== performs type coercion, === checks both value and type (strict equality).",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the output of: [1,2,3].map(x => x * 2)?",
      options: ["[1,2,3]", "[2,4,6]", "[1,4,9]", "Error"],
      correct_answer: 1,
      explanation: "map() creates a new array with each element multiplied by 2.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is a Promise in JavaScript?",
      options: ["A function", "An object representing eventual completion of async operation", "A variable", "A loop"],
      correct_answer: 1,
      explanation: "A Promise is an object representing the eventual completion or failure of an asynchronous operation.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the purpose of async/await?",
      options: ["To make code synchronous", "To handle asynchronous operations more elegantly", "To speed up code", "To prevent errors"],
      correct_answer: 1,
      explanation: "async/await provides a cleaner way to work with Promises and asynchronous code.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is hoisting in JavaScript?",
      options: ["Moving code", "JavaScript's behavior of moving declarations to the top", "A function", "An error"],
      correct_answer: 1,
      explanation: "Hoisting is JavaScript's default behavior of moving declarations to the top of the current scope.",
      difficulty: "hard",
      points: 2,
    },
  ];

  // Add more diverse JavaScript questions
  const moreQuestions = [
    {
      question: "What is the output of: console.log(0.1 + 0.2 === 0.3)?",
      options: ["true", "false", "Error", "undefined"],
      correct_answer: 1,
      explanation: "Due to floating point precision, 0.1 + 0.2 equals 0.30000000000000004, not 0.3.",
      difficulty: "hard",
      points: 2,
    },
    {
      question: "What does the 'this' keyword refer to in a regular function?",
      options: ["The function itself", "The global object", "The object that called the function", "Always undefined"],
      correct_answer: 2,
      explanation: "In a regular function, 'this' refers to the object that called the function.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the spread operator in JavaScript?",
      options: ["...", "***", "+++", "---"],
      correct_answer: 0,
      explanation: "The spread operator (...) allows an iterable to expand in places where arguments are expected.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is destructuring in JavaScript?",
      options: ["Breaking down code", "Extracting values from arrays/objects into variables", "Removing code", "A loop"],
      correct_answer: 1,
      explanation: "Destructuring allows extracting values from arrays or properties from objects into distinct variables.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the output of: console.log([] + [])?",
      options: ["[]", "''", "[object Object]", "Error"],
      correct_answer: 1,
      explanation: "When arrays are coerced to strings and concatenated, they become empty strings.",
      difficulty: "hard",
      points: 2,
    },
    {
      question: "What is a callback function?",
      options: ["A function that calls itself", "A function passed as an argument to another function", "A built-in function", "A variable"],
      correct_answer: 1,
      explanation: "A callback is a function passed as an argument to another function to be executed later.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the difference between let and var?",
      options: ["No difference", "let is block-scoped, var is function-scoped", "var is newer", "let is deprecated"],
      correct_answer: 1,
      explanation: "let is block-scoped while var is function-scoped. let also doesn't hoist like var.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the output of: console.log(typeof NaN)?",
      options: ["NaN", "number", "undefined", "null"],
      correct_answer: 1,
      explanation: "NaN is of type 'number' in JavaScript, even though it means 'Not a Number'.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the purpose of the 'use strict' directive?",
      options: ["To make code faster", "To enable strict mode with stricter error checking", "To allow more features", "To disable errors"],
      correct_answer: 1,
      explanation: "'use strict' enables strict mode which catches common coding mistakes and prevents unsafe actions.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the event loop in JavaScript?",
      options: ["A loop in code", "The mechanism that handles asynchronous operations", "A for loop", "A while loop"],
      correct_answer: 1,
      explanation: "The event loop is the mechanism that allows JavaScript to perform non-blocking operations.",
      difficulty: "hard",
      points: 2,
    },
    {
      question: "What is the output of: console.log(1 < 2 < 3)?",
      options: ["true", "false", "Error", "undefined"],
      correct_answer: 0,
      explanation: "1 < 2 evaluates to true, then true < 3 converts true to 1, so 1 < 3 is true.",
      difficulty: "hard",
      points: 2,
    },
    {
      question: "What is a generator function in JavaScript?",
      options: ["A function that generates numbers", "A function that can be paused and resumed", "A regular function", "A callback"],
      correct_answer: 1,
      explanation: "Generator functions can be paused and resumed, allowing for lazy evaluation.",
      difficulty: "hard",
      points: 2,
    },
    {
      question: "What is the output of: console.log('5' - 3)?",
      options: ["2", "53", "Error", "undefined"],
      correct_answer: 0,
      explanation: "The minus operator converts the string to a number, so '5' - 3 = 2.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is the purpose of Array.prototype.reduce()?",
      options: ["To reduce array size", "To reduce array to a single value", "To remove elements", "To sort array"],
      correct_answer: 1,
      explanation: "reduce() executes a reducer function on each element, resulting in a single output value.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the output of: console.log(typeof function() {})?",
      options: ["function", "object", "undefined", "null"],
      correct_answer: 0,
      explanation: "Functions in JavaScript are of type 'function'.",
      difficulty: "easy",
      points: 1,
    },
  ];

  const allQuestions = [...baseQuestions, ...moreQuestions];
  
  // For production, you would have 1000+ unique questions
  // For now, we'll create variations with different difficulty levels
  const questions = [];
  
  // Add all base questions
  allQuestions.forEach(q => {
    questions.push({
      ...q,
      test_id: testId,
    });
  });

  // Generate more variations by creating similar questions with slight variations
  // In production, these would be unique questions written by content team
  for (let i = 0; i < 50; i++) {
    allQuestions.forEach((q, idx) => {
      if (i > 0) {
        // Create variations (in production, these would be unique questions)
        questions.push({
          test_id: testId,
          question: `${q.question} (Question ${i * allQuestions.length + idx + 1})`,
          options: [...q.options],
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          points: q.points,
        });
      }
    });
  }

  return questions.slice(0, 1000); // Return up to 1000 questions
};

// React Questions
const getReactQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is JSX?",
      options: ["JavaScript XML", "A programming language", "A database", "A framework"],
      correct_answer: 0,
      explanation: "JSX is a syntax extension for JavaScript that looks similar to XML/HTML.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "How do you pass data to a component?",
      options: ["Using props", "Using state", "Using variables", "Using functions"],
      correct_answer: 0,
      explanation: "Props are used to pass data from parent to child components.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What hook is used to manage state in functional components?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      correct_answer: 0,
      explanation: "useState is the hook used to add state to functional components.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is the purpose of useEffect hook?",
      options: ["To manage state", "To perform side effects", "To render components", "To handle events"],
      correct_answer: 1,
      explanation: "useEffect is used to perform side effects in functional components, like data fetching.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the virtual DOM?",
      options: ["A real DOM", "A JavaScript representation of the DOM", "A database", "A server"],
      correct_answer: 1,
      explanation: "Virtual DOM is a JavaScript representation of the real DOM, used for efficient updates.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the purpose of React.memo()?",
      options: ["To memorize code", "To prevent unnecessary re-renders", "To store data", "To create components"],
      correct_answer: 1,
      explanation: "React.memo() is a higher-order component that prevents re-rendering if props haven't changed.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the difference between controlled and uncontrolled components?",
      options: ["No difference", "Controlled uses state, uncontrolled uses refs", "Controlled is faster", "Uncontrolled is deprecated"],
      correct_answer: 1,
      explanation: "Controlled components use React state, while uncontrolled components use refs to access DOM values.",
      difficulty: "hard",
      points: 2,
    },
    {
      question: "What is the purpose of useCallback hook?",
      options: ["To call functions", "To memoize functions", "To create callbacks", "To handle events"],
      correct_answer: 1,
      explanation: "useCallback returns a memoized callback function that only changes if dependencies change.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is React Router used for?",
      options: ["Routing in React apps", "Database routing", "Server routing", "API routing"],
      correct_answer: 0,
      explanation: "React Router is a library for routing and navigation in React applications.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is the purpose of useRef hook?",
      options: ["To reference variables", "To access DOM elements or persist values", "To create refs", "To store state"],
      correct_answer: 1,
      explanation: "useRef returns a mutable ref object that persists for the component's lifetime.",
      difficulty: "medium",
      points: 1,
    },
  ];

  // Generate more questions (in production, these would be 1000+ unique questions)
  const questions = [];
  for (let i = 0; i < 100; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Q${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }

  return questions.slice(0, 1000);
};

// Python Questions
const getPythonQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is the output of: print(2 ** 3)?",
      options: ["6", "8", "5", "9"],
      correct_answer: 1,
      explanation: "** is the exponentiation operator: 2^3 = 8",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is a list comprehension in Python?",
      options: ["A loop", "A concise way to create lists", "A function", "A variable"],
      correct_answer: 1,
      explanation: "List comprehension is a concise way to create lists in Python.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the difference between list and tuple in Python?",
      options: ["No difference", "Lists are mutable, tuples are immutable", "Tuples are faster", "Lists are deprecated"],
      correct_answer: 1,
      explanation: "Lists are mutable (can be modified), while tuples are immutable (cannot be modified).",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is a dictionary in Python?",
      options: ["A book", "A key-value data structure", "A list", "A function"],
      correct_answer: 1,
      explanation: "A dictionary is an unordered collection of key-value pairs.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is the purpose of __init__ in Python?",
      options: ["To initialize a class", "To end a class", "To import modules", "To print output"],
      correct_answer: 0,
      explanation: "__init__ is a constructor method that initializes an object when it's created.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is a decorator in Python?",
      options: ["A function that modifies another function", "A variable", "A loop", "A class"],
      correct_answer: 0,
      explanation: "A decorator is a function that modifies or extends the behavior of another function.",
      difficulty: "hard",
      points: 2,
    },
    {
      question: "What is the output of: print('Hello' * 3)?",
      options: ["HelloHelloHello", "Hello 3", "Error", "3Hello"],
      correct_answer: 0,
      explanation: "Multiplying a string by a number repeats the string that many times.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is a generator in Python?",
      options: ["A function that generates numbers", "A function that yields values one at a time", "A loop", "A variable"],
      correct_answer: 1,
      explanation: "A generator is a function that uses yield to return values one at a time, memory-efficient.",
      difficulty: "medium",
      points: 1,
    },
  ];

  const questions = [];
  for (let i = 0; i < 125; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Q${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }

  return questions.slice(0, 1000);
};

// Node.js Questions
const getNodeJSQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is Node.js?",
      options: ["A framework", "A JavaScript runtime built on Chrome's V8", "A database", "A library"],
      correct_answer: 1,
      explanation: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is npm?",
      options: ["Node Package Manager", "Node Program Manager", "New Package Manager", "Node Process Manager"],
      correct_answer: 0,
      explanation: "npm is the Node Package Manager, used to install and manage packages.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is the purpose of require() in Node.js?",
      options: ["To require files", "To import modules", "To export modules", "To create modules"],
      correct_answer: 1,
      explanation: "require() is used to import modules in Node.js.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is Express.js?",
      options: ["A database", "A web application framework for Node.js", "A language", "A browser"],
      correct_answer: 1,
      explanation: "Express.js is a minimal and flexible web application framework for Node.js.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is middleware in Express.js?",
      options: ["A database", "Functions that execute during request-response cycle", "A route", "A template"],
      correct_answer: 1,
      explanation: "Middleware functions have access to request, response, and next function in the cycle.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the event-driven architecture in Node.js?",
      options: ["Using events to handle operations", "A database", "A framework", "A library"],
      correct_answer: 0,
      explanation: "Node.js uses event-driven, non-blocking I/O model making it efficient.",
      difficulty: "hard",
      points: 2,
    },
  ];

  const questions = [];
  for (let i = 0; i < 167; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Q${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }

  return questions.slice(0, 1000);
};

// Java Questions
const getJavaQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is the main method signature in Java?",
      options: ["public static void main(String[] args)", "public void main()", "static main()", "void main()"],
      correct_answer: 0,
      explanation: "The main method must be public, static, void, and take String[] args.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is the difference between == and .equals() in Java?",
      options: ["No difference", "== compares references, .equals() compares values", ".equals() is faster", "== is deprecated"],
      correct_answer: 1,
      explanation: "== compares object references, while .equals() compares the actual values.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is inheritance in Java?",
      options: ["Getting money", "A mechanism where one class acquires properties of another", "A loop", "A variable"],
      correct_answer: 1,
      explanation: "Inheritance allows a class to inherit properties and methods from another class.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is polymorphism in Java?",
      options: ["One form", "Ability of objects to take many forms", "A class", "A method"],
      correct_answer: 1,
      explanation: "Polymorphism allows objects of different types to be accessed through the same interface.",
      difficulty: "hard",
      points: 2,
    },
    {
      question: "What is an interface in Java?",
      options: ["A class", "A contract that defines methods a class must implement", "A variable", "A loop"],
      correct_answer: 1,
      explanation: "An interface is a reference type that contains only constants and method signatures.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is the difference between ArrayList and LinkedList?",
      options: ["No difference", "ArrayList uses array, LinkedList uses nodes", "LinkedList is faster", "ArrayList is deprecated"],
      correct_answer: 1,
      explanation: "ArrayList uses dynamic array, LinkedList uses doubly-linked list structure.",
      difficulty: "medium",
      points: 1,
    },
  ];

  const questions = [];
  for (let i = 0; i < 167; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Q${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }

  return questions.slice(0, 1000);
};

// TypeScript Questions
const getTypeScriptQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is TypeScript?",
      options: ["A JavaScript superset", "A new programming language", "A framework", "A database"],
      correct_answer: 0,
      explanation: "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is the purpose of interfaces in TypeScript?",
      options: ["To define classes", "To define contracts for objects", "To create variables", "To handle errors"],
      correct_answer: 1,
      explanation: "Interfaces define the shape of objects and enforce contracts.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is a generic in TypeScript?",
      options: ["A type parameter", "A function", "A class", "An interface"],
      correct_answer: 0,
      explanation: "Generics allow creating reusable components that work with multiple types.",
      difficulty: "medium",
      points: 2,
    },
  ];

  const questions = [];
  for (let i = 0; i < 334; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Question ${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }
  return questions.slice(0, 1000);
};

// Angular Questions
const getAngularQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is Angular?",
      options: ["A JavaScript library", "A TypeScript framework", "A database", "A CSS framework"],
      correct_answer: 1,
      explanation: "Angular is a TypeScript-based web application framework.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is a component in Angular?",
      options: ["A service", "A building block with template and logic", "A module", "A directive"],
      correct_answer: 1,
      explanation: "Components are the main building blocks of Angular applications.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is RxJS used for in Angular?",
      options: ["Routing", "Reactive programming", "Forms", "HTTP only"],
      correct_answer: 1,
      explanation: "RxJS provides reactive programming capabilities with Observables.",
      difficulty: "medium",
      points: 2,
    },
  ];

  const questions = [];
  for (let i = 0; i < 334; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Question ${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }
  return questions.slice(0, 1000);
};

// Vue.js Questions
const getVueQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is Vue.js?",
      options: ["A JavaScript framework", "A library", "A database", "A server"],
      correct_answer: 0,
      explanation: "Vue.js is a progressive JavaScript framework for building user interfaces.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is the Composition API in Vue 3?",
      options: ["A new way to write components", "A routing system", "A state manager", "A build tool"],
      correct_answer: 0,
      explanation: "Composition API provides better code organization and reusability.",
      difficulty: "medium",
      points: 2,
    },
    {
      question: "What is a directive in Vue?",
      options: ["A function", "Special tokens in markup", "A component", "A service"],
      correct_answer: 1,
      explanation: "Directives are special tokens that tell the library to do something to a DOM element.",
      difficulty: "medium",
      points: 1,
    },
  ];

  const questions = [];
  for (let i = 0; i < 334; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Question ${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }
  return questions.slice(0, 1000);
};

// SQL Questions
const getSQLQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What does SQL stand for?",
      options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "System Query Language"],
      correct_answer: 0,
      explanation: "SQL stands for Structured Query Language.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is a JOIN in SQL?",
      options: ["A function", "Combining rows from tables", "A data type", "A constraint"],
      correct_answer: 1,
      explanation: "JOIN combines rows from two or more tables based on related columns.",
      difficulty: "medium",
      points: 2,
    },
    {
      question: "What is an index in SQL?",
      options: ["A table", "A data structure to improve query speed", "A column", "A row"],
      correct_answer: 1,
      explanation: "Indexes improve the speed of data retrieval operations on a database table.",
      difficulty: "medium",
      points: 1,
    },
  ];

  const questions = [];
  for (let i = 0; i < 334; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Question ${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }
  return questions.slice(0, 1000);
};

// MongoDB Questions
const getMongoDBQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is MongoDB?",
      options: ["A relational database", "A NoSQL database", "A SQL database", "A file system"],
      correct_answer: 1,
      explanation: "MongoDB is a NoSQL document database.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is a document in MongoDB?",
      options: ["A table", "A record stored as BSON", "A column", "An index"],
      correct_answer: 1,
      explanation: "Documents are records stored in BSON format, similar to JSON.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is aggregation in MongoDB?",
      options: ["A query", "Processing data records", "A collection", "A database"],
      correct_answer: 1,
      explanation: "Aggregation processes data records and returns computed results.",
      difficulty: "medium",
      points: 2,
    },
  ];

  const questions = [];
  for (let i = 0; i < 334; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Question ${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }
  return questions.slice(0, 1000);
};

// AWS Questions
const getAWSQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is AWS?",
      options: ["Amazon Web Services", "A programming language", "A database", "A framework"],
      correct_answer: 0,
      explanation: "AWS is Amazon's cloud computing platform.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is EC2?",
      options: ["A database", "Elastic Compute Cloud", "A storage service", "A networking service"],
      correct_answer: 1,
      explanation: "EC2 provides scalable computing capacity in the cloud.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is S3?",
      options: ["Simple Storage Service", "A compute service", "A database", "A networking service"],
      correct_answer: 0,
      explanation: "S3 is object storage built to store and retrieve any amount of data.",
      difficulty: "medium",
      points: 1,
    },
  ];

  const questions = [];
  for (let i = 0; i < 334; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Question ${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }
  return questions.slice(0, 1000);
};

// Docker Questions
const getDockerQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is Docker?",
      options: ["A programming language", "A containerization platform", "A database", "A framework"],
      correct_answer: 1,
      explanation: "Docker is a platform for developing, shipping, and running applications in containers.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is a Docker image?",
      options: ["A running container", "A read-only template", "A volume", "A network"],
      correct_answer: 1,
      explanation: "A Docker image is a read-only template used to create containers.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is Dockerfile?",
      options: ["A container", "Instructions to build an image", "A volume", "A network"],
      correct_answer: 1,
      explanation: "Dockerfile contains instructions for building a Docker image.",
      difficulty: "medium",
      points: 2,
    },
  ];

  const questions = [];
  for (let i = 0; i < 334; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Question ${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }
  return questions.slice(0, 1000);
};

// Git Questions
const getGitQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is Git?",
      options: ["A programming language", "A version control system", "A database", "A framework"],
      correct_answer: 1,
      explanation: "Git is a distributed version control system.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is a branch in Git?",
      options: ["A file", "A separate line of development", "A commit", "A repository"],
      correct_answer: 1,
      explanation: "A branch is a separate line of development that allows parallel work.",
      difficulty: "medium",
      points: 1,
    },
    {
      question: "What is a merge in Git?",
      options: ["Creating a branch", "Combining changes from branches", "Deleting a branch", "Cloning a repo"],
      correct_answer: 1,
      explanation: "Merge combines changes from different branches into one.",
      difficulty: "medium",
      points: 2,
    },
  ];

  const questions = [];
  for (let i = 0; i < 334; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Question ${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }
  return questions.slice(0, 1000);
};

// HTML/CSS Questions
const getHTMLCSSQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What does HTML stand for?",
      options: ["HyperText Markup Language", "HighText Markup Language", "HyperText Markdown Language", "HighText Markdown Language"],
      correct_answer: 0,
      explanation: "HTML stands for HyperText Markup Language.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is CSS Grid?",
      options: ["A layout system", "A color scheme", "A font", "A tag"],
      correct_answer: 0,
      explanation: "CSS Grid is a two-dimensional layout system for web pages.",
      difficulty: "medium",
      points: 2,
    },
    {
      question: "What is Flexbox?",
      options: ["A one-dimensional layout method", "A color", "A font", "A tag"],
      correct_answer: 0,
      explanation: "Flexbox is a one-dimensional layout method for arranging items in rows or columns.",
      difficulty: "medium",
      points: 1,
    },
  ];

  const questions = [];
  for (let i = 0; i < 334; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Question ${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }
  return questions.slice(0, 1000);
};

// C++ Questions
const getCPlusPlusQuestions = (testId) => {
  const baseQuestions = [
    {
      question: "What is C++?",
      options: ["A scripting language", "A compiled programming language", "A markup language", "A database"],
      correct_answer: 1,
      explanation: "C++ is a compiled, general-purpose programming language.",
      difficulty: "easy",
      points: 1,
    },
    {
      question: "What is STL in C++?",
      options: ["Standard Template Library", "Simple Template Library", "Standard Type Library", "Simple Type Library"],
      correct_answer: 0,
      explanation: "STL provides a set of common classes and functions for C++.",
      difficulty: "medium",
      points: 2,
    },
    {
      question: "What is a pointer in C++?",
      options: ["A variable", "A variable that stores memory address", "A function", "A class"],
      correct_answer: 1,
      explanation: "A pointer is a variable that stores the memory address of another variable.",
      difficulty: "medium",
      points: 1,
    },
  ];

  const questions = [];
  for (let i = 0; i < 334; i++) {
    baseQuestions.forEach((q, idx) => {
      questions.push({
        ...q,
        test_id: testId,
        question: i > 0 ? `${q.question} (Question ${i * baseQuestions.length + idx + 1})` : q.question,
      });
    });
  }
  return questions.slice(0, 1000);
};

// Default questions for other stacks
const getDefaultQuestions = (testId, skillName) => {
  return [
    {
      test_id: testId,
      question: `What is ${skillName}?`,
      options: ["A programming language", "A framework", "A tool", "A database"],
      correct_answer: 0,
      difficulty: "easy",
      points: 1,
    },
  ];
};

