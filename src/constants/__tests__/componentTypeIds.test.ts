import { describe, it, expect } from 'vitest';
import { COMPONENT_TYPE_ID } from '../componentTypeIds';

describe('COMPONENT_TYPE_ID', () => {
  it('maps all chat room grid variants to ChatRoom enum id 4', () => {
    expect(COMPONENT_TYPE_ID.chatRoom).toBe(4);
    expect(COMPONENT_TYPE_ID.chatRoomGrid).toBe(4);
    expect(COMPONENT_TYPE_ID.chatRoomCarousel).toBe(4);
  });

  it('maps story variants to 6 and reel to 7', () => {
    expect(COMPONENT_TYPE_ID.storyGrid).toBe(6);
    expect(COMPONENT_TYPE_ID.reel).toBe(7);
  });
});
