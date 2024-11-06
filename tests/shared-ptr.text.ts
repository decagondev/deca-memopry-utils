import { SharedPtr, WeakPtr } from '../src/shared-ptr';

describe('SharedPtr', () => {
  interface TestObject {
    id: number;
    value: string;
  }

  const createTestObject = (): TestObject => ({
    id: 1,
    value: 'test'
  });

  describe('Basic Operations', () => {
    test('should create empty shared pointer', () => {
      const ptr = new SharedPtr<TestObject>();
      expect(ptr.isValid()).toBe(false);
      expect(ptr.get()).toBeNull();
      expect(ptr.useCount()).toBe(0);
    });

    test('should create shared pointer with value', () => {
      const obj = createTestObject();
      const ptr = SharedPtr.make(obj);
      expect(ptr.isValid()).toBe(true);
      expect(ptr.get()).toEqual(obj);
      expect(ptr.useCount()).toBe(1);
    });

    test('should create shared pointer using static make method', () => {
      const obj = createTestObject();
      const ptr = SharedPtr.make(obj);
      expect(ptr.isValid()).toBe(true);
      expect(ptr.get()).toEqual(obj);
    });
  });

  describe('Reference Counting', () => {
    test('should increment reference count when copying', () => {
      const ptr1 = SharedPtr.make(createTestObject());
      const ptr2 = SharedPtr.fromSharedPtr(ptr1);
      expect(ptr1.useCount()).toBe(2);
      expect(ptr2.useCount()).toBe(2);
    });

    test('should decrement reference count when destroying', () => {
      const ptr1 = SharedPtr.make(createTestObject());
      const ptr2 = SharedPtr.fromSharedPtr(ptr1);
      expect(ptr1.useCount()).toBe(2);
      
      ptr2.destroy();
      expect(ptr1.useCount()).toBe(1);
    });

    test('should handle multiple references correctly', () => {
      const ptr1 = SharedPtr.make(createTestObject());
      const ptr2 = SharedPtr.fromSharedPtr(ptr1);
      const ptr3 = SharedPtr.fromSharedPtr(ptr1);
      
      expect(ptr1.useCount()).toBe(3);
      ptr2.destroy();
      expect(ptr1.useCount()).toBe(2);
      ptr3.destroy();
      expect(ptr1.useCount()).toBe(1);
    });
  });

  describe('Destructor', () => {
    test('should call destructor when last reference is destroyed', () => {
      const mockDestructor = jest.fn();
      const obj = createTestObject();
      
      const ptr = SharedPtr.make(obj, mockDestructor);
      expect(mockDestructor).not.toHaveBeenCalled();
      
      ptr.destroy();
      expect(mockDestructor).toHaveBeenCalledWith(obj);
    });

    test('should not call destructor until last reference is gone', () => {
      const mockDestructor = jest.fn();
      const ptr1 = SharedPtr.make(createTestObject(), mockDestructor);
      const ptr2 = SharedPtr.fromSharedPtr(ptr1);
      
      ptr1.destroy();
      expect(mockDestructor).not.toHaveBeenCalled();
      
      ptr2.destroy();
      expect(mockDestructor).toHaveBeenCalled();
    });
  });

  describe('Reset', () => {
    test('should reset to empty state', () => {
      const ptr = SharedPtr.make(createTestObject());
      ptr.reset();
      expect(ptr.isValid()).toBe(false);
      expect(ptr.get()).toBeNull();
    });

    test('should reset to new value', () => {
      const obj1 = createTestObject();
      const obj2 = { ...obj1, id: 2 };
      
      const ptr = SharedPtr.make(obj1);
      ptr.reset(obj2);
      expect(ptr.get()).toEqual(obj2);
    });

    test('should handle destructor when resetting', () => {
      const mockDestructor = jest.fn();
      const ptr = SharedPtr.make(createTestObject(), mockDestructor);
      ptr.reset();
      expect(mockDestructor).toHaveBeenCalled();
    });
  });

  describe('WeakPtr Integration', () => {
    test('should create weak pointer from shared pointer', () => {
      const ptr = SharedPtr.make(createTestObject());
      const weakPtr = new WeakPtr(ptr);
      expect(weakPtr.expired()).toBe(false);
    });

    test('should expire weak pointer when shared pointer is destroyed', () => {
      const ptr = SharedPtr.make(createTestObject());
      const weakPtr = new WeakPtr(ptr);
      ptr.destroy();
      expect(weakPtr.expired()).toBe(true);
    });

    test('should lock weak pointer to create shared pointer', () => {
      const original = createTestObject();
      const ptr = SharedPtr.make(original);
      const weakPtr = new WeakPtr(ptr);
      
      const lockedPtr = weakPtr.lock();
      expect(lockedPtr).not.toBeNull();
      expect(lockedPtr?.get()).toEqual(original);
      expect(ptr.useCount()).toBe(2);
    });

    test('should not lock expired weak pointer', () => {
      const ptr = SharedPtr.make(createTestObject());
      const weakPtr = new WeakPtr(ptr);
      ptr.destroy();
      
      const lockedPtr = weakPtr.lock();
      expect(lockedPtr).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    test('should handle null destructor', () => {
      const ptr = SharedPtr.make(createTestObject());
      expect(() => ptr.destroy()).not.toThrow();
    });

    test('should handle multiple resets', () => {
      const ptr = SharedPtr.make(createTestObject());
      ptr.reset();
      ptr.reset();
      expect(ptr.isValid()).toBe(false);
    });

    test('should handle circular references', () => {
      interface CircularObject {
        id: number;
        ref?: SharedPtr<CircularObject>;
      }

      const obj1: CircularObject = { id: 1 };
      const obj2: CircularObject = { id: 2 };
      
      const ptr1 = SharedPtr.make(obj1);
      const ptr2 = SharedPtr.make(obj2);
      
      obj1.ref = ptr2;
      obj2.ref = ptr1;
      
      obj1.ref = undefined;
      obj2.ref = undefined;
      
      ptr1.destroy();
      ptr2.destroy();
      
      expect(ptr1.isValid()).toBe(false);
      expect(ptr2.isValid()).toBe(false);
    });
  });

  describe('Swap Operation', () => {
    test('should swap two shared pointers', () => {
      const obj1 = createTestObject();
      const obj2 = { ...obj1, id: 2 };
      
      const ptr1 = SharedPtr.make(obj1);
      const ptr2 = SharedPtr.make(obj2);
      
      ptr1.swap(ptr2);
      
      expect(ptr1.get()).toEqual(obj2);
      expect(ptr2.get()).toEqual(obj1);
    });

    test('should handle swapping with empty pointer', () => {
      const ptr1 = SharedPtr.make(createTestObject());
      const ptr2 = new SharedPtr<TestObject>();
      
      ptr1.swap(ptr2);
      
      expect(ptr1.isValid()).toBe(false);
      expect(ptr2.isValid()).toBe(true);
    });
  });

  describe('Release Operation', () => {
    test('should release ownership without calling destructor', () => {
      const mockDestructor = jest.fn();
      const obj = createTestObject();
      const ptr = SharedPtr.make(obj, mockDestructor);
      
      const released = ptr.release();
      expect(released).toEqual(obj);
      expect(ptr.isValid()).toBe(false);
      expect(mockDestructor).not.toHaveBeenCalled();
    });

    test('should return null when releasing empty pointer', () => {
      const ptr = new SharedPtr<TestObject>();
      expect(ptr.release()).toBeNull();
    });
  });
});