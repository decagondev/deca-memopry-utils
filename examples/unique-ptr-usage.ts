import { UniquePtr } from '../src';

// Example 1: Basic usage
const ptr1 = new UniquePtr({ name: "Example 1", value: 42 });
console.log("Initial value:", ptr1.get());

// Example 2: Moving ownership
const ptr2 = ptr1.move();
console.log("After move - ptr1:", ptr1.get());
console.log("After move - ptr2:", ptr2.get());

// Example 3: Resetting with new value
ptr2.reset({ name: "Example 3", value: 100 });
console.log("After reset:", ptr2.get());

// Example 4: Releasing ownership
const released = ptr2.release();
console.log("Released value:", released);
console.log("After release:", ptr2.get());

// Example 5: Demonstrating prevention of accidental copying
try {
  JSON.stringify(ptr2);
} catch (e) {
  console.log("Prevented JSON serialization:", e.message);
}