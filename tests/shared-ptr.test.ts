import { SharedPtr, WeakPtr } from '../src/shared-ptr.js';

function createTestObject(id = 1) {
  return { id };
}
describe('SharedPtr Tests', () => {

  test('should create SharedPtr with value', () => {
    const obj = createTestObject();
    const ptr = SharedPtr.make(obj);

    expect(ptr.isValid()).toBe(true);
    expect(ptr.get()).toEqual(obj);
    expect(ptr.useCount()).toBe(1);
  });

  test('should reset SharedPtr with new value', () => {
    const obj1 = createTestObject(1);
    const obj2 = createTestObject(2);

    const ptr = SharedPtr.make(obj1);
    expect(ptr.get()).toEqual(obj1);
    expect(ptr.useCount()).toBe(1);

    ptr.reset(obj2);
    expect(ptr.get()).toEqual(obj2);
    expect(ptr.useCount()).toBe(1);
  });

  test('should swap two SharedPtrs', () => {
    const obj1 = createTestObject(1);
    const obj2 = createTestObject(2);

    const ptr1 = SharedPtr.make(obj1);
    const ptr2 = SharedPtr.make(obj2);

    expect(ptr1.get()).toEqual(obj1);
    expect(ptr2.get()).toEqual(obj2);
    expect(ptr1.useCount()).toBe(1);
    expect(ptr2.useCount()).toBe(1);

    ptr1.swap(ptr2);

    expect(ptr1.get()).toEqual(obj2);
    expect(ptr2.get()).toEqual(obj1);
    expect(ptr1.useCount()).toBe(1);
    expect(ptr2.useCount()).toBe(1);
  });

  test('should release SharedPtr', () => {
    const obj = createTestObject();
    const ptr = SharedPtr.make(obj);

    expect(ptr.isValid()).toBe(true);
    const released = ptr.release();
    expect(released).toEqual(obj);
    expect(ptr.isValid()).toBe(false);
  });

  test('should handle swapping with empty pointer', () => {
    const ptr1 = SharedPtr.make(createTestObject());
    const ptr2 = new SharedPtr<any>();

    expect(ptr1.isValid()).toBe(true);
    expect(ptr2.isValid()).toBe(false);

    ptr1.swap(ptr2);
 
    expect(ptr1.isValid()).toBe(false);
    expect(ptr2.isValid()).toBe(true);
  });

  test('should decrement reference count and destroy on release', () => {
    const obj = createTestObject();
    const ptr1 = SharedPtr.make(obj);
    const ptr2 = SharedPtr.fromSharedPtr(ptr1);

    
    expect(ptr1.useCount()).toBe(2);

    const released = ptr1.release();
    expect(released).toEqual(obj);
    expect(ptr1.isValid()).toBe(false);
    expect(ptr2.isValid()).toBe(true);
    expect(ptr2.useCount()).toBe(1);
  });

});

describe('WeakPtr Tests', () => {
  

  test('should create valid WeakPtr from SharedPtr', () => {
    const obj = createTestObject();
    const ptr = SharedPtr.make(obj);
    const weakPtr = new WeakPtr(ptr);

    expect(weakPtr.isValid()).toBe(true);
    expect(weakPtr.get()).toEqual(obj);
  });

  test('should return null if referenced object is destroyed', () => {
    const obj = createTestObject();
    const ptr = SharedPtr.make(obj);
    const weakPtr = new WeakPtr(ptr);

    ptr.destroy();

    expect(weakPtr.isValid()).toBe(false);
    expect(weakPtr.get()).toBeNull();
  });

  test('should reset weak pointer correctly', () => {
    const obj = createTestObject();
    const ptr = SharedPtr.make(obj);
    const weakPtr = new WeakPtr(ptr);

    weakPtr.reset();

    expect(weakPtr.isValid()).toBe(false);
    expect(weakPtr.get()).toBeNull();
  });
});
