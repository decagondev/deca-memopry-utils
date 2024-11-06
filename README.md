# deca-memory-utils

A TypeScript utility library providing memory management tools like UniquePtr and SharedPtr for better control over object ownership and lifecycle.

## Installation

```bash
npm install deca-memory-utils
```

## Features

- **UniquePtr**: A TypeScript implementation of unique pointer pattern, ensuring single ownership of resources
- **SharedPtr**: Reference-counted smart pointer implementation for shared resource management
- **WeakPtr**: Weak reference implementation that doesn't prevent resource cleanup
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

### UniquePtr Example

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

### SharedPtr Example

```typescript
import { SharedPtr, WeakPtr } from 'deca-memory-utils';

// Create a shared pointer with a destructor
const cleanup = (value: object) => console.log('Cleaning up:', value);
const shared1 = new SharedPtr({ data: "shared resource" }, cleanup);

// Create another reference to the same resource
const shared2 = SharedPtr.fromSharedPtr(shared1);
console.log(shared1.useCount()); // 2

// Create a weak reference
const weak1 = new WeakPtr(shared1);

// Access the value through weak reference
const locked = weak1.lock();
if (locked) {
  console.log(locked.get()); // { data: "shared resource" }
}

// Reset first shared pointer
shared1.reset();
console.log(shared2.useCount()); // 1

// Resource is still alive through shared2
console.log(shared2.get()); // { data: "shared resource" }

// Reset second shared pointer
shared2.reset();
// Destructor is called, resource is cleaned up

// Weak reference is now expired
console.log(weak1.expired()); // true
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

### SharedPtr<T>

#### Constructor
- `constructor(value?: NonNullable<T>, destructor?: Destructor<T>)`: Creates a new SharedPtr instance

#### Static Methods
- `make<T>(value: NonNullable<T>, destructor?: Destructor<T>): SharedPtr<T>`: Create a new SharedPtr
- `fromSharedPtr<T>(other: SharedPtr<T>): SharedPtr<T>`: Create a new SharedPtr from an existing one

#### Instance Methods
- `get(): NonNullable<T> | null`: Access the underlying object
- `getRaw(): NonNullable<T> | null`: Get the raw pointer value
- `isValid(): boolean`: Check if the pointer is valid
- `useCount(): number`: Get the current reference count
- `reset(value?: NonNullable<T>, destructor?: Destructor<T>): void`: Reset with a new value
- `swap(other: SharedPtr<T>): void`: Swap managed resources with another SharedPtr
- `release(): NonNullable<T> | null`: Release ownership without calling destructor
- `destroy(): void`: Destroy the shared pointer and decrement reference count

### WeakPtr<T>

#### Constructor
- `constructor(shared?: SharedPtr<T>)`: Creates a new WeakPtr instance

#### Methods
- `lock(): SharedPtr<T> | null`: Create a SharedPtr if resource is still valid
- `reset(): void`: Reset the weak pointer
- `expired(): boolean`: Check if the referenced resource has been cleaned up

## Project Structure

```
deca-memory-utils/
├── .gitignore
├── .npmignore
├── package.json
├── tsconfig.json
├── jest.config.cjs
├── README.md
├── LICENSE
├── src/
│   ├── index.ts
│   ├── unique-ptr.ts
│   └── shared-ptr.ts
├── tests/
│   ├── unique-ptr.test.ts
│   └── shared-ptr.test.ts
└── examples/
    ├── unique-ptr-usage.ts
    └── shared-ptr-usage.ts
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

### [1.1.0] - 2024-11-06
#### Added
- SharedPtr implementation with reference counting
- WeakPtr implementation for weak references
- Comprehensive memory management features
- Additional test coverage for shared pointer functionality

### [1.0.0] - 2024-11-06
#### Added
- Initial release
- UniquePtr implementation with full TypeScript support
- ESM module configuration
- Basic ownership management functionality
- Prevention of accidental copying
- Comprehensive test suite with Jest
- Example usage code
- Full API documentation

## Versioning

This project follows [Semantic Versioning](https://semver.org/). For the versions available, see the tags on this repository.

## License

MIT