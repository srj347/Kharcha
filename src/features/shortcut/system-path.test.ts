import { rewriteSystemPath, SHORTCUT_TARGET } from './system-path';

describe('rewriteSystemPath', () => {
  it.each(['kharcha://record?src=shortcut', 'kharcha://record', 'kharcha:///record', '/record', 'record?src=shortcut'])(
    'sends %p to the listening Add tab',
    (path) => {
      expect(rewriteSystemPath(path)).toBe(SHORTCUT_TARGET);
    },
  );

  it.each(['/', '/history', 'kharcha://insights', 'exp+kharcha://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081', '/records'])(
    'leaves %p alone',
    (path) => {
      expect(rewriteSystemPath(path)).toBe(path);
    },
  );
});
