/**
 * Appends and returns an element with the specified attributes with the
 * primary purpose of circumventing a strict Content-Security-Policy that
 * forbids adding inline code or style.
 *
 * @param parentNode - The parent node to which the new node will be appended.
 * It can be inside ShadowDOM: `someElement.shadowRoot`. When omitted, it'll be
 * determined automatically:
 * - `document.head` (`<head>`) for `script`, `link`, `style`, `meta` tags
 * - `document.body` (`<body>`) for other tags or when there's no `<head>`
 * - `document.documentElement` (`<html>` or an XML root node) otherwise
 * @param tagName - A tag name like 'script'.
 * @param attributes - The keys are HTML attributes, not DOM properties, except
 * `textContent` which sets DOM property `textContent`. The values are strings so
 * if you want to assign a private function to onload you can do it after the
 * element is created.
 */
declare function GM_addElement(tagName: string, attributes: object): Element;
declare function GM_addElement(parentNode: Node | Element | ShadowRoot, tagName: string, attributes: object): Element;

/**
 * Appends and returns a <style> element with the specified CSS.
 *
 * @param css - The CSS code to inject.
 */
declare function GM_addStyle(css: string): HTMLStyleElement;

/**
 * @param defaultValue - The default value to return if no value exists in the
 * storage.
 */
declare function GM_getValue(key: string, defaultValue: any): any;
/**
 * @param value - The value to be stored, which must be JSON serializable
 * (string, number, boolean, null, or an array/object consisting of these
 * types) so for example you can't store DOM elements or objects with cyclic
 * dependencies.
 */
declare function GM_setValue(key: string, value: any): void;
