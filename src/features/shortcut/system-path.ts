// The "Log Expense" App Intent (Back Tap, Action Button, Siri) opens
// kharcha://record?src=shortcut. That lands on the Add tab, which listens
// at once, and marks expenses saved from it as coming from the shortcut.
export const SHORTCUT_TARGET = '/?src=shortcut';

const RECORD_PATH = /^(?:kharcha:\/\/\/?|\/)?record\/?(?:\?.*)?$/;

export function rewriteSystemPath(path: string): string {
  return RECORD_PATH.test(path) ? SHORTCUT_TARGET : path;
}
