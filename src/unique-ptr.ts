/**
 * UniquePtr class implements the unique pointer pattern, ensuring single ownership
 * of a resource. When ownership is transferred, the original pointer becomes null.
 */
export class UniquePtr<T> {
    private value: T | null;
  
    /**
     * Creates a new UniquePtr instance
     * @param value - The initial value to store
     */
    constructor(value: T | null = null) {
      this.value = value;
    }
  
    /**
     * Access the underlying object
     * @returns The stored value or null if empty
     */
    get(): T | null {
      return this.value;
    }
  
    /**
     * Release ownership and return the object
     * @returns The released value
     */
    release(): T | null {
      const releasedValue = this.value;
      this.value = null; // Reset to null to signify no ownership
      return releasedValue;
    }
  
    /**
     * Reset the UniquePtr with a new value, freeing the previous one
     * @param newValue - The new value to store
     */
    reset(newValue: T | null = null): void {
      this.value = newValue;
    }
  
    /**
     * Move ownership to a new UniquePtr
     * @returns A new UniquePtr instance with the current value
     */
    move(): UniquePtr<T> {
      const newPtr = new UniquePtr(this.value);
      this.value = null; // Transfer ownership, so current UniquePtr is empty
      return newPtr;
    }
  
    /**
     * Prevent accidental copying through JSON serialization
     * @throws Error indicating that UniquePtr cannot be cloned
     */
    toJSON(): never {
      throw new Error("UniquePtr cannot be cloned or copied.");
    }
  
    /**
     * Prevent accidental copying through value conversion
     * @throws Error indicating that UniquePtr cannot be cloned
     */
    valueOf(): never {
      throw new Error("UniquePtr cannot be cloned or copied.");
    }
  }