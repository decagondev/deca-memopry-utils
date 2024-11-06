type Destructor<T> = (value: NonNullable<T>) => void;

/**
 * A control block to manage the reference and weak counts for a shared value.
 * It holds the value, reference count, weak count, and an optional destructor function.
 */
class ControlBlock<T> {
  private referenceCount: number = 1;
  private weakCount: number = 0;

  constructor(
    public value: NonNullable<T>, // This guarantees that `value` cannot be null or undefined
    private destructor?: Destructor<T>
  ) {}

  incrementRef(): void {
    this.referenceCount++;
  }

  decrementRef(): boolean {
    this.referenceCount--;
    if (this.referenceCount === 0) {
      if (this.destructor) {
        this.destructor(this.value);  // Call destructor if exists
      }
      return true;  // Indicate that the object is destroyed
    }
    return false; // Object not destroyed, still in use
  }

  getRefCount(): number {
    return this.referenceCount;
  }

  incrementWeak(): void {
    this.weakCount++;
  }

  decrementWeak(): void {
    this.weakCount--;
  }

  getWeakCount(): number {
    return this.weakCount;
  }
}

/**
 * A shared pointer class that manages the lifecycle of a shared resource using reference counting.
 */
export class SharedPtr<T> {
    public controlBlock: ControlBlock<T> | null;
  
    constructor(value?: NonNullable<T>, destructor?: Destructor<T>) {
      if (value === undefined) {
        this.controlBlock = null;
      } else {
        this.controlBlock = new ControlBlock(value, destructor);
      }
    }
  
    public setControlBlock(block: ControlBlock<T> | null): void {
      this.controlBlock = block;
    }
  
    static make<T>(value: NonNullable<T>, destructor?: Destructor<T>): SharedPtr<T> {
      return new SharedPtr(value, destructor);
    }
  
    static fromSharedPtr<T>(other: SharedPtr<T>): SharedPtr<T> {
      const ptr = new SharedPtr<T>();
      if (other.controlBlock) {
        ptr.setControlBlock(other.controlBlock);
        other.controlBlock.incrementRef();  // Ensure reference count is incremented when copying
      }
      return ptr;
    }
  
    static fromControlBlock<T>(controlBlock: ControlBlock<T>): SharedPtr<T> {
      const ptr = new SharedPtr<T>();
      ptr.setControlBlock(controlBlock);
      return ptr;
    }
  
    get(): NonNullable<T> | null {
      return this.controlBlock ? this.controlBlock.value : null;
    }
  
    isValid(): boolean {
      return this.controlBlock !== null;
    }
  
    useCount(): number {
      return this.controlBlock ? this.controlBlock.getRefCount() : 0;
    }
  
    reset(value?: NonNullable<T>, destructor?: Destructor<T>): void {
      if (this.controlBlock) {
        this.controlBlock.decrementRef();
        this.controlBlock = null;
      }
  
      if (value !== undefined) {
        this.controlBlock = new ControlBlock(value, destructor);
      }
    }
  
    swap(other: SharedPtr<T>): void {
      const temp = this.controlBlock;
      this.controlBlock = other.controlBlock;
      other.setControlBlock(temp);
    }
  
    release(): NonNullable<T> | null {
      if (!this.controlBlock) {
        return null; // If no control block exists, nothing to release
      }
  
      // Get the value of the object before decrementing reference count
      const value = this.controlBlock.value;
  
      // Decrement the reference count
      this.controlBlock.decrementRef();  // Decrement, regardless of count
  
      // This SharedPtr no longer owns the resource
      this.controlBlock = null;
  
      return value;
    }
  
    destroy(): void {
      if (this.controlBlock) {
        this.controlBlock.decrementRef();
        this.controlBlock = null;
      }
    }
  
    public getControlBlock(): ControlBlock<T> | null {
      return this.controlBlock;
    }
  }

/**
 * A weak pointer class that provides non-owning references to a shared resource.
 */
export class WeakPtr<T> {
    private controlBlock: ControlBlock<T> | null;
  
    constructor(ptr: SharedPtr<T>) {
      this.controlBlock = ptr.getControlBlock();
      if (this.controlBlock) {
        this.controlBlock.incrementWeak();
      }
    }
  
    isValid(): boolean {
      return this.controlBlock !== null && this.controlBlock.getRefCount() > 0;
    }
  
    get(): NonNullable<T> | null | undefined {
      return this.isValid() ? this.controlBlock?.value : null;
    }
  
    reset(): void {
      if (this.controlBlock) {
        this.controlBlock.decrementWeak();
        this.controlBlock = null;
      }
    }
  
    destroy(): void {
      this.reset();
    }
  
    expired(): boolean {
      return !this.isValid();
    }
  
    lock(): SharedPtr<T> | null {
      if (this.isValid() && this.controlBlock) {
        this.controlBlock.incrementRef();
        return SharedPtr.fromControlBlock(this.controlBlock);
      } else {
        return null;
      }
    }
  }