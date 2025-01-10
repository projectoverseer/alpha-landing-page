const fs = require('fs');
const path = require('path');

// Load the class name mapping
const classMapPath = path.resolve(__dirname, '_classMap.json');
if (!fs.existsSync(classMapPath)) {
    console.error('Error: _classMap.json not found. Run your PostCSS build first.');
    process.exit(1);
}
const classMap = JSON.parse(fs.readFileSync(classMapPath, 'utf8'));

// Function to replace class names in HTML
function replaceClassNamesInHTML(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/class="([^"]+)"/g, (match, classNames) => {
        const updatedClassNames = classNames
            .split(/\s+/) // Split by spaces
            .map((name) => classMap[name] || name) // Replace class names
            .join(' '); // Join them back
        return `class="${updatedClassNames}"`;
    });
    fs.writeFileSync(filePath, content);
    console.log(`Updated class names in ${filePath}`);
}

// Function to replace class names in JavaScript
function replaceClassNamesInJS(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/(['"`])([^'"\s]+)(['"`])/g, (match, start, className, end) => {
        if (classMap[className]) {
            return `${start}${classMap[className]}${end}`;
        }
        return match; // Leave unchanged if not a class name
    });
    fs.writeFileSync(filePath, content);
    console.log(`Updated class names in ${filePath}`);
}

// Specify files to process
const filesToProcess = [
    { path: path.resolve(__dirname, '_site/index.html'), type: 'html' },
    { path: path.resolve(__dirname, '_site/js/custom.js'), type: 'js' },
];

// Process each file
filesToProcess.forEach(({ path: filePath, type }) => {
    if (fs.existsSync(filePath)) {
        if (type === 'html') {
            replaceClassNamesInHTML(filePath);
        } else if (type === 'js') {
            replaceClassNamesInJS(filePath);
        }
    } else {
        console.warn(`Warning: File ${filePath} does not exist.`);
    }
});
