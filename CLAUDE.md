# CLAUDE.md - Project Guidelines

## Build/Dev Commands
```bash
# Start the CLI tool
npm start

# Build for web deployment
npm run build:web

# Start development server with hot reload
npm run dev

# Run the CLI with specific commands
node string-to-address-cli.js generate "Your string here"
node string-to-address-cli.js verify <bitcoin-address> "Your string here"
```

## Code Style Guidelines

### Architecture
- Library functions in separate modules (`alpha-address-commitment.js`)
- CLI interfaces in separate files (`string-to-address-cli.js`)
- Separation of crypto logic from UI/CLI concerns

### Code Style
- Use JSDoc comments for all exported functions
- Error handling with try/catch and detailed error messages
- Use const for variables that don't change
- Descriptive variable names (camelCase)
- Buffer for binary data handling
- Consistent 2-space indentation
- Early returns for error cases

### Shell Scripts
- Use proper error handling and variable checking
- Add comments for complex operations
- Format output for readability (tables with headers)
- Use color coding for important information