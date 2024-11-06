import { UniquePtr } from '../src/index';

describe('UniquePtr', () => {
  it('should create a UniquePtr with initial value', () => {
    const ptr = new UniquePtr({ data: 'test' });
    expect(ptr.get()).toEqual({ data: 'test' });
  });

  it('should create an empty UniquePtr', () => {
    const ptr = new UniquePtr();
    expect(ptr.get()).toBeNull();
  });

  it('should transfer ownership via move()', () => {
    const ptr1 = new UniquePtr({ data: 'test' });
    const ptr2 = ptr1.move();

    expect(ptr1.get()).toBeNull();
    expect(ptr2.get()).toEqual({ data: 'test' });
  });

  it('should release ownership via release()', () => {
    const ptr = new UniquePtr({ data: 'test' });
    const released = ptr.release();

    expect(released).toEqual({ data: 'test' });
    expect(ptr.get()).toBeNull();
  });

  it('should reset with new value', () => {
    const ptr = new UniquePtr({ data: 'test' });
    ptr.reset({ data: 'new value' });

    expect(ptr.get()).toEqual({ data: 'new value' });
  });

  it('should reset to null', () => {
    const ptr = new UniquePtr({ data: 'test' });
    ptr.reset();

    expect(ptr.get()).toBeNull();
  });

  it('should prevent JSON serialization', () => {
    const ptr = new UniquePtr({ data: 'test' });
    expect(() => JSON.stringify(ptr)).toThrow('UniquePtr cannot be cloned or copied.');
  });

  it('should prevent value conversion', () => {
    const ptr = new UniquePtr({ data: 'test' });
    expect(() => ptr.valueOf()).toThrow('UniquePtr cannot be cloned or copied.');
  });
});