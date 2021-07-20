export const mockOnmessage = jest.fn();
export const mockPostMessage = jest.fn();

const WebpackWorker = jest.fn().mockImplementation(() => ({
  onmessage: mockOnmessage,
  postMessage: mockPostMessage,
}));

export default WebpackWorker;
