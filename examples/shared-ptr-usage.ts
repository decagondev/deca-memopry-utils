import { SharedPtr, WeakPtr } from '../src/index';

// Example 1: Basic SharedPtr usage with a simple object
console.log('\n=== Basic SharedPtr Usage ===');
const simpleShared = new SharedPtr({ message: "Hello World" });
console.log('Initial value:', simpleShared.get());
console.log('Reference count:', simpleShared.useCount());

// Create another reference
const anotherRef = SharedPtr.fromSharedPtr(simpleShared);
console.log('Reference count after sharing:', simpleShared.useCount());

// Example 2: SharedPtr with custom destructor
console.log('\n=== SharedPtr with Custom Destructor ===');
class DatabaseConnection {
  constructor(public id: string) {
    console.log(`Database connection ${id} established`);
  }
}

const connectionDestructor = (conn: DatabaseConnection) => {
  console.log(`Closing database connection ${conn.id}`);
};

const dbConnection = new SharedPtr(
  new DatabaseConnection("conn-1"),
  connectionDestructor
);

// Share the connection
const sharedConnection = SharedPtr.fromSharedPtr(dbConnection);
console.log('Active connections:', dbConnection.useCount());

// Clean up one reference
dbConnection.reset();
console.log('Connections after first reset:', sharedConnection.useCount());

// Example 3: WeakPtr usage
console.log('\n=== WeakPtr Usage ===');
class CacheEntry {
  constructor(public data: string) {}
}

// Create a cache entry with shared ownership
const cacheEntry = new SharedPtr(new CacheEntry("important data"));

// Create a weak reference to track the cache entry
const weakCache = new WeakPtr(cacheEntry);

// Function to check and display cache status
const checkCache = () => {
  console.log('Is cache expired?', weakCache.expired());
  const lockedCache = weakCache.lock();
  if (lockedCache) {
    console.log('Cache data:', lockedCache.get()?.data);
  } else {
    console.log('Cache entry no longer exists');
  }
};

// Check initial state
checkCache();

// Release the strong reference
cacheEntry.reset();

// Check state after release
checkCache();

// Example 4: Complex object lifecycle
console.log('\n=== Complex Object Lifecycle ===');
class Resource {
  constructor(public name: string, public data: number[]) {
    console.log(`Resource ${name} created`);
  }
}

class ResourceManager {
  private resources: Map<string, SharedPtr<Resource>> = new Map();
  private weakRefs: Map<string, WeakPtr<Resource>> = new Map();

  addResource(name: string, data: number[]): void {
    const resource = new SharedPtr(
      new Resource(name, data),
      (r) => console.log(`Resource ${r.name} destroyed`)
    );
    this.resources.set(name, resource);
    this.weakRefs.set(name, new WeakPtr(resource));
  }

  getResource(name: string): SharedPtr<Resource> | null {
    const weakRef = this.weakRefs.get(name);
    if (weakRef) {
      return weakRef.lock();
    }
    return null;
  }

  releaseResource(name: string): void {
    const resource = this.resources.get(name);
    if (resource) {
      resource.reset();
      this.resources.delete(name);
    }
  }

  isResourceValid(name: string): boolean {
    const weakRef = this.weakRefs.get(name);
    return weakRef ? !weakRef.expired() : false;
  }
}

// Demonstrate ResourceManager usage
const manager = new ResourceManager();

// Add a resource
manager.addResource("resource1", [1, 2, 3]);

// Get and use the resource
const resource = manager.getResource("resource1");
console.log('Resource data:', resource?.get()?.data);

// Check if resource is valid
console.log('Is resource valid?', manager.isResourceValid("resource1"));

// Release the resource
manager.releaseResource("resource1");

// Check again after release
console.log('Is resource valid after release?', manager.isResourceValid("resource1"));

// Example 5: SharedPtr swap operation
console.log('\n=== SharedPtr Swap Operation ===');
const ptr1 = new SharedPtr({ id: 1, value: "first" });
const ptr2 = new SharedPtr({ id: 2, value: "second" });

console.log('Before swap:');
console.log('Ptr1:', ptr1.get());
console.log('Ptr2:', ptr2.get());

ptr1.swap(ptr2);

console.log('After swap:');
console.log('Ptr1:', ptr1.get());
console.log('Ptr2:', ptr2.get());

// Clean up remaining shared pointers
sharedConnection.reset();
ptr1.reset();
ptr2.reset();

// Example 6: Circular references and cleanup
console.log('\n=== Circular References ===');
class Node {
  constructor(public value: string) {}
  public next: SharedPtr<Node> | null = null;
}

// Create nodes with shared ownership
const node1 = new SharedPtr(new Node("Node 1"));
const node2 = new SharedPtr(new Node("Node 2"));

// Create circular reference
node1.get()!.next = SharedPtr.fromSharedPtr(node2);
node2.get()!.next = SharedPtr.fromSharedPtr(node1);

console.log('Node1 ref count:', node1.useCount());
console.log('Node2 ref count:', node2.useCount());

// Break circular reference and cleanup
node1.get()!.next = null;
node2.get()!.next = null;

node1.reset();
node2.reset();