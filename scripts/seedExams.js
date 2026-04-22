import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Exam } from '../src/models/Exam.js';

dotenv.config();

const examTopics = [
    { title: 'JavaScript Fundamentals', subject: 'Programming', questions: 15 },
    { title: 'Data Structures and Algorithms', subject: 'Computer Science', questions: 20 },
    { title: 'Web Development Basics', subject: 'Web Development', questions: 12 },
    { title: 'Database Management Systems', subject: 'Database', questions: 18 },
    { title: 'Object-Oriented Programming', subject: 'Programming', questions: 25 },
    { title: 'Computer Networks', subject: 'Networking', questions: 22 },
    { title: 'Operating Systems', subject: 'Systems', questions: 30 },
    { title: 'Software Engineering Principles', subject: 'Software Engineering', questions: 16 },
    { title: 'Python Programming', subject: 'Programming', questions: 14 },
    { title: 'Cloud Computing Fundamentals', subject: 'Cloud', questions: 10 }
];

const questionTemplates = {
    'JavaScript Fundamentals': [
        { text: 'What is the output of typeof null?', options: ['object', 'null', 'undefined', 'number'], correct: 0 },
        { text: 'Which keyword is used to declare a constant?', options: ['var', 'let', 'const', 'static'], correct: 2 },
        { text: 'What does === operator check?', options: ['Value only', 'Type only', 'Both value and type', 'Neither'], correct: 2 },
        { text: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correct: 0 },
        { text: 'What is a closure in JavaScript?', options: ['A loop', 'A function with access to outer scope', 'A class', 'An object'], correct: 1 }
    ],
    'Data Structures and Algorithms': [
        { text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
        { text: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Array', 'Tree'], correct: 1 },
        { text: 'What is the best case time complexity of Quick Sort?', options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], correct: 0 },
        { text: 'Which traversal visits root node first?', options: ['Inorder', 'Preorder', 'Postorder', 'Level order'], correct: 1 },
        { text: 'What is a hash collision?', options: ['Two keys map to same index', 'Invalid key', 'Empty hash table', 'Overflow'], correct: 0 }
    ],
    'Web Development Basics': [
        { text: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'], correct: 0 },
        { text: 'Which CSS property changes text color?', options: ['font-color', 'text-color', 'color', 'foreground'], correct: 2 },
        { text: 'What is the correct HTML for a hyperlink?', options: ['<a url="...">link</a>', '<a href="...">link</a>', '<link>...</link>', '<hyperlink>...</hyperlink>'], correct: 1 },
        { text: 'Which HTTP method is used to update data?', options: ['GET', 'POST', 'PUT', 'DELETE'], correct: 2 },
        { text: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'], correct: 0 }
    ],
    'Database Management Systems': [
        { text: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language'], correct: 0 },
        { text: 'Which is a NoSQL database?', options: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle'], correct: 2 },
        { text: 'What is a primary key?', options: ['Unique identifier', 'Foreign reference', 'Index', 'Constraint'], correct: 0 },
        { text: 'Which normal form eliminates transitive dependency?', options: ['1NF', '2NF', '3NF', 'BCNF'], correct: 2 },
        { text: 'What is ACID in databases?', options: ['A programming language', 'Database properties', 'A query type', 'A storage engine'], correct: 1 }
    ],
    'Object-Oriented Programming': [
        { text: 'What is encapsulation?', options: ['Hiding implementation details', 'Creating objects', 'Inheritance', 'Polymorphism'], correct: 0 },
        { text: 'Which OOP principle allows code reuse?', options: ['Abstraction', 'Encapsulation', 'Inheritance', 'Polymorphism'], correct: 2 },
        { text: 'What is method overloading?', options: ['Same name, different parameters', 'Different name, same parameters', 'Overriding parent method', 'Creating new method'], correct: 0 },
        { text: 'What is an abstract class?', options: ['Cannot be instantiated', 'Has no methods', 'Is final', 'Is static'], correct: 0 },
        { text: 'What is polymorphism?', options: ['Many forms', 'Single form', 'No form', 'Abstract form'], correct: 0 }
    ],
    'Computer Networks': [
        { text: 'What layer is HTTP in OSI model?', options: ['Physical', 'Data Link', 'Network', 'Application'], correct: 3 },
        { text: 'What is the default port for HTTPS?', options: ['80', '443', '8080', '3000'], correct: 1 },
        { text: 'What does DNS do?', options: ['Encrypts data', 'Resolves domain names', 'Routes packets', 'Manages bandwidth'], correct: 1 },
        { text: 'Which protocol is connectionless?', options: ['TCP', 'UDP', 'HTTP', 'FTP'], correct: 1 },
        { text: 'What is an IP address?', options: ['Physical address', 'Logical address', 'MAC address', 'Port number'], correct: 1 }
    ],
    'Operating Systems': [
        { text: 'What is a process?', options: ['Program in execution', 'Stored program', 'CPU instruction', 'Memory block'], correct: 0 },
        { text: 'What is virtual memory?', options: ['RAM', 'Hard disk space used as RAM', 'Cache', 'ROM'], correct: 1 },
        { text: 'What is a deadlock?', options: ['Process waiting indefinitely', 'Process termination', 'Memory leak', 'CPU overload'], correct: 0 },
        { text: 'Which scheduling algorithm is non-preemptive?', options: ['Round Robin', 'FCFS', 'Priority', 'Multilevel'], correct: 1 },
        { text: 'What is thrashing?', options: ['Excessive paging', 'Fast execution', 'Memory allocation', 'Process creation'], correct: 0 }
    ],
    'Software Engineering Principles': [
        { text: 'What is Agile methodology?', options: ['Waterfall approach', 'Iterative development', 'Sequential process', 'Documentation-heavy'], correct: 1 },
        { text: 'What does SOLID stand for?', options: ['Design principles', 'Testing framework', 'Database model', 'Programming language'], correct: 0 },
        { text: 'What is version control?', options: ['Managing code changes', 'Testing code', 'Deploying code', 'Writing code'], correct: 0 },
        { text: 'What is continuous integration?', options: ['Frequent code merging', 'Manual testing', 'Code review', 'Documentation'], correct: 0 },
        { text: 'What is refactoring?', options: ['Improving code structure', 'Adding features', 'Fixing bugs', 'Writing tests'], correct: 0 }
    ],
    'Python Programming': [
        { text: 'What is a list in Python?', options: ['Immutable sequence', 'Mutable sequence', 'Dictionary', 'Set'], correct: 1 },
        { text: 'Which keyword defines a function?', options: ['function', 'def', 'func', 'define'], correct: 1 },
        { text: 'What is a tuple?', options: ['Mutable list', 'Immutable list', 'Dictionary', 'Set'], correct: 1 },
        { text: 'What does len() do?', options: ['Returns length', 'Creates list', 'Sorts items', 'Removes items'], correct: 0 },
        { text: 'What is a lambda function?', options: ['Anonymous function', 'Named function', 'Class method', 'Built-in function'], correct: 0 }
    ],
    'Cloud Computing Fundamentals': [
        { text: 'What is IaaS?', options: ['Infrastructure as a Service', 'Internet as a Service', 'Integration as a Service', 'Information as a Service'], correct: 0 },
        { text: 'Which is a cloud provider?', options: ['AWS', 'MySQL', 'Linux', 'Apache'], correct: 0 },
        { text: 'What is serverless computing?', options: ['No servers needed', 'Managed server infrastructure', 'Local servers', 'Physical servers'], correct: 1 },
        { text: 'What is auto-scaling?', options: ['Automatic resource adjustment', 'Manual scaling', 'Fixed resources', 'No scaling'], correct: 0 },
        { text: 'What is cloud storage?', options: ['Local disk', 'Remote data storage', 'RAM', 'Cache'], correct: 1 }
    ]
};

function generateQuestions(topic, count) {
    const templates = questionTemplates[topic] || questionTemplates['JavaScript Fundamentals'];
    const questions = [];

    for (let i = 0; i < count; i++) {
        const template = templates[i % templates.length];
        questions.push({
            prompt: `${template.text} (Q${i + 1})`,
            options: template.options,
            correctIndex: template.correct
        });
    }

    return questions;
}

async function seedExams() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Clear existing exams
        await Exam.deleteMany({});
        console.log('Cleared existing exams');

        // Create 10 exams
        for (const examData of examTopics) {
            const questions = generateQuestions(examData.title, examData.questions);

            const exam = await Exam.create({
                title: examData.title,
                durationMinutes: Math.ceil(examData.questions * 1.5), // 1.5 minutes per question
                questions: questions,
                resultsPublished: false
            });

            console.log(`Created: ${exam.title} with ${questions.length} questions`);
        }

        console.log('\n✅ Successfully created 10 exams!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedExams();
