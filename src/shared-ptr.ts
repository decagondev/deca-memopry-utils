/**
 * A function type representing a destructor or cleanup function.
 * @param value - The non-null value to be cleaned up or destroyed.
 */
type Destructor<T> = (value: NonNullable<T>) => void;

/**
 * A control block to manage the reference and weak counts for a shared value.
 * It holds the value, reference count, weak count, and an optional destructor function.
 */
class ControlBlock<T> {
  private referenceCount: number = 1;
  private weakCount: number = 0;

  /**
   * Constructs a ControlBlock with a given value and optional destructor.
   * @param value - The non-null value to be managed.
   * @param destructor - An optional function to clean up the value when reference count reaches zero.
   */
  constructor(
    public value: NonNullable<T>,
    private destructor?: Destructor<T>
  ) {}

  /**
   * Increments the reference count.
   */
  incrementRef(): void {
    this.referenceCount++;
  }

  /**
   * Decrements the reference count and invokes the destructor if count reaches zero.
   * @returns `true` if the reference count reached zero, `false` otherwise.
   */
  decrementRef(): boolean {
    this.referenceCount--;
    if (this.referenceCount === 0) {
      if (this.destructor) {
        this.destructor(this.value);
      }
      return true;
    }
    return false;
  }

  /**
   * Gets the current reference count.
   * @returns The reference count.
   */
  getRefCount(): number {
    return this.referenceCount;
  }

  /**
   * Increments the weak count.
   */
  incrementWeak(): void {
    this.weakCount++;
  }

  /**
   * Decrements the weak count.
   */
  decrementWeak(): void {
    this.weakCount--;
  }

  /**
   * Gets the current weak count.
   * @returns The weak count.
   */
  getWeakCount(): number {
    return this.weakCount;
  }
}

/**
 * A shared pointer class that manages the lifecycle of a shared resource using reference counting.
 */
export class SharedPtr<T> {
  protected controlBlock: ControlBlock<T> | null;

  /**
   * Constructs a SharedPtr with an optional value and destructor.
   * @param value - The non-null value to be managed.
   * @param destructor - An optional function to clean up the value when reference count reaches zero.
   */
  constructor(value?: NonNullable<T>, destructor?: Destructor<T>) {
    this.controlBlock = value !== undefined ? new ControlBlock(value, destructor) : null;
  }

  /**
   * Sets the control block. Protected to allow internal usage.
   * @param block - The new control block to set.
   */
  protected setControlBlock(block: ControlBlock<T> | null): void {
    this.controlBlock = block;
  }

  /**
   * Creates a new SharedPtr with a specified value and optional destructor.
   * @param value - The non-null value to be managed.
   * @param destructor - An optional destructor for the value.
   * @returns A new SharedPtr instance.
   */
  static make<T>(value: NonNullable<T>, destructor?: Destructor<T>): SharedPtr<T> {
    return new SharedPtr(value, destructor);
  }

  /**
   * Creates a new SharedPtr from an existing SharedPtr.
   * @param other - Another SharedPtr to copy from.
   * @returns A new SharedPtr instance with an incremented reference count.
   */
  static fromSharedPtr<T>(other: SharedPtr<T>): SharedPtr<T> {
    const ptr = new SharedPtr<T>();
    ptr.setControlBlock(other.controlBlock);
    if (ptr.controlBlock) {
      ptr.controlBlock.incrementRef();
    }
    return ptr;
  }

  /**
   * Gets the underlying value.
   * @returns The managed value or `null` if no control block exists.
   */
  get(): NonNullable<T> | null {
    return this.controlBlock ? this.controlBlock.value : null;
  }

  /**
   * Gets the raw pointer value.
   * @returns The managed value or `null` if no control block exists.
   */
  getRaw(): NonNullable<T> | null {
    return this.get();
  }

  /**
   * Checks if the pointer is valid (non-null control block).
   * @returns `true` if valid, `false` otherwise.
   */
  isValid(): boolean {
    return this.controlBlock !== null;
  }

  /**
   * Gets the current reference count.
   * @returns The reference count.
   */
  useCount(): number {
    return this.controlBlock ? this.controlBlock.getRefCount() : 0;
  }

  /**
   * Resets the shared pointer to a new value and optional destructor.
   * If a previous control block exists, decrements its reference count.
   * @param value - The new value to manage, or undefined to release ownership.
   * @param destructor - Optional destructor for the new value.
   */
  reset(value?: NonNullable<T>, destructor?: Destructor<T>): void {
    if (this.controlBlock && this.controlBlock.decrementRef()) {
      this.controlBlock = null;
    }

    if (value !== undefined) {
      this.controlBlock = new ControlBlock(value, destructor);
    }
  }

  /**
   * Swaps the managed resource with another SharedPtr.
   * @param other - The other SharedPtr to swap with.
   */
  swap(other: SharedPtr<T>): void {
    const temp = this.controlBlock;
    other.setControlBlock(this.controlBlock);
    this.controlBlock = temp;
  }

  /**
   * Releases ownership of the managed value without calling the destructor.
   * @returns The managed value or `null` if no control block exists.
   */
  release(): NonNullable<T> | null {
    if (!this.controlBlock) {
      return null;
    }
    const value = this.controlBlock.value;
    this.controlBlock = null;
    return value;
  }

  /**
   * Destroys the shared pointer, decrementing reference count and releasing ownership.
   */
  destroy(): void {
    if (this.controlBlock && this.controlBlock.decrementRef()) {
      this.controlBlock = null;
    }
  }

  /**
   * Gets the control block. Used by WeakPtr to access internal control structures.
   * @returns The control block or `null`.
   */
  public getControlBlock(): ControlBlock<T> | null {
    return this.controlBlock;
  }
}

/**
 * An internal class to allow manipulation of the control block directly.
 */
class InternalSharedPtr<T> extends SharedPtr<T> {
  /**
   * Sets the control block from an existing block.
   * @param block - The control block to set.
   */
  setFromControlBlock(block: ControlBlock<T> | null): void {
    this.setControlBlock(block);
  }
}

/**
 * A weak pointer class that does not affect the reference count but tracks a resource weakly.
 */
export class WeakPtr<T> {
  private controlBlock: ControlBlock<T> | null;

  /**
   * Constructs a WeakPtr from an optional SharedPtr.
   * @param shared - The SharedPtr to derive the weak pointer from.
   */
  constructor(shared?: SharedPtr<T>) {
    this.controlBlock = shared?.getControlBlock() ?? null;
    if (this.controlBlock) {
      this.controlBlock.incrementWeak();
    }
  }

  /**
   * Locks the weak pointer to create a SharedPtr if the resource is still valid.
   * @returns A new SharedPtr or `null` if expired.
   */
  lock(): SharedPtr<T> | null {
    if (!this.controlBlock || this.controlBlock.getRefCount() === 0) {
      return null;
    }

    const ptr = new InternalSharedPtr<T>();
    ptr.setFromControlBlock(this.controlBlock);
    this.controlBlock.incrementRef();
    return ptr;
  }

  /**
   * Resets the weak pointer, decrementing weak count.
   */
  reset(): void {
    if (this.controlBlock) {
      this.controlBlock.decrementWeak();
      this.controlBlock = null;
    }
  }

  /**
   * Checks if the weak pointer has expired (i.e., reference count is zero).
   * @returns `true` if expired, `false` otherwise.
   */
  expired(): boolean {
    return !this.controlBlock || this.controlBlock.getRefCount() === 0;
  }
}
