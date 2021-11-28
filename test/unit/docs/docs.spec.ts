import docs from './docs.json';
import { listToTree } from '~/lib/docs';
describe('Tree utils', () => {
  // Initialize state
  let state: ReturnType<typeof listToTree>;
  beforeAll(() => {
    state = listToTree(docs as any);
  });

  it('should contain 5 toplevel items', () => {
    expect(state).toHaveLength(6);
  });

  it('should contain items with path', () => {
    expect(state).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/index'
        }),
        expect.objectContaining({
          path: '/doc1'
        }),
        expect.objectContaining({
          path: '/doc2'
        }),
        expect.objectContaining({
          path: '/doc3'
        }),
        expect.objectContaining({
          path: '/doc4'
        }),
        expect.objectContaining({
          path: '/subfolder/index'
        })
      ])
    );
  });

  it('should be sorted correctly', () => {
    expect(state.map((file) => file.url)).toEqual(['/', '/doc1', '/doc2', '/doc3', '/doc4', '/subfolder']);
  });

  it('should contain', () => {
    expect(state[0].path).toBe('/index');
  });

  it('should contain', () => {
    expect(state[1].path).toBe('/doc1');
  });
});
