# deca-memory-utils

A TypeScript utility library providing memory management tools like UniquePtr for better control over object ownership and lifecycle.

## Installation

```bash
npm install deca-memory-utils
```

## Features

- **UniquePtr**: A TypeScript implementation of unique pointer pattern, ensuring single ownership of resources
- Type-safe implementation with full TypeScript support
- Zero dependencies
- Comprehensive test coverage
- Full ESM (ECMAScript Modules) support

## Module Support

This package is distributed as an ES Module (ESM). Make sure your project is configured to handle ESM:

```json
// package.json
{
  "type": "module"
}
```

If you're using TypeScript, ensure your tsconfig.json includes:
```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "node"
  }
}
```

## Usage

```typescript
import { UniquePtr } from 'deca-memory-utils';

// Create a new unique pointer
const ptr1 = new UniquePtr({ name: "John", data: [1, 2, 3] });

// Access the value
console.log(ptr1.get()); // { name: "John", data: [1, 2, 3] }

// Transfer ownership
const ptr2 = ptr1.move();
console.log(ptr1.get()); // null (ownership transferred)
console.log(ptr2.get()); // { name: "John", data: [1, 2, 3] }

// Reset with new value
ptr2.reset({ name: "Jane", data: [4, 5, 6] });

// Release ownership
const releasedValue = ptr2.release();
console.log(releasedValue); // { name: "Jane", data: [4, 5, 6] }
console.log(ptr2.get()); // null
```

## API Reference

### UniquePtr<T>

#### Constructor
- `constructor(value: T | null = null)`: Creates a new UniquePtr instance

#### Methods
- `get(): T | null`: Access the underlying object
- `release(): T | null`: Release ownership and return the object
- `reset(newValue: T | null = null): void`: Reset with a new value
- `move(): UniquePtr<T>`: Transfer ownership to a new UniquePtr

## Project Structure

```
deca-memory-utils/
├── .gitignore
├── .npmignore
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
├── LICENSE
├── src/
│   ├── index.ts
│   └── unique-ptr.ts
├── tests/
│   └── unique-ptr.test.ts
└── examples/
    └── basic-usage.ts
```

## Development

### Prerequisites
- Node.js (v16 or higher recommended)
- npm (v7 or higher)

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/deca-memory-utils.git
cd deca-memory-utils

# Install dependencies
npm install
```

### Scripts
```bash
# Run tests (uses Node.js experimental modules support)
npm test

# Build
npm run build

# Lint
npm run lint
```

### Testing
The project uses Jest with ts-jest for testing. The setup includes:
- Full ESM support using Node.js experimental modules
- TypeScript integration via ts-jest
- Test files should use `.test.ts` extension
- Tests are located in the `tests` directory

To run tests:
```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Changelog

### [1.0.0] - 2024-11-06
#### Added
- Initial release
- UniquePtr implementation with full TypeScript support
- ESM module configuration
- Basic ownership management functionality:
  - get() method for accessing values
  - move() method for ownership transfer
  - reset() method for value replacement
  - release() method for ownership release
- Prevention of accidental copying via toJSON and valueOf
- Comprehensive test suite with Jest
- Example usage code
- Full API documentation

## Versioning

This project follows [Semantic Versioning](https://semver.org/). For the versions available, see the tags on this repository.

## License

MIT
