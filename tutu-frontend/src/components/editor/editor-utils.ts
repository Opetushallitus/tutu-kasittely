import { createHeadlessEditor } from '@lexical/headless';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  BOLD_STAR,
  LINK,
  ORDERED_LIST,
  TRANSFORMERS,
  UNORDERED_LIST,
} from '@lexical/markdown';
import { $isAtNodeEnd, $setBlocksType } from '@lexical/selection';
import {
  $addUpdateTag,
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  ElementNode,
  LexicalEditor,
  RangeSelection,
  SKIP_SELECTION_FOCUS_TAG,
  TextNode,
} from 'lexical';

import { anyRealContentInHtml } from '@/src/lib/utils';

const MARKDOWN_TRANSFORMERS = [ORDERED_LIST, UNORDERED_LIST, LINK, BOLD_STAR];

export const importHtml = (editor: LexicalEditor | null, html: string) => {
  if (editor) {
    editor.update(
      () => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $getRoot().select();
        $getRoot().clear();
        $insertNodes(nodes);
      },
      { discrete: true },
    );
  }
};

export const exportHtml = (editor: LexicalEditor | null) => {
  if (editor) {
    let content = '';
    editor.read(() => {
      content = $generateHtmlFromNodes(editor);
    });
    return content;
  }
  return '';
};

export const importMarkdown = (
  editor: LexicalEditor | null,
  markdown: string,
) => {
  if (editor) {
    editor.update(() => {
      $convertFromMarkdownString(markdown, TRANSFORMERS);
    });
  }
};

export const exportMarkdown = (editor: LexicalEditor | null) => {
  if (editor) {
    let content = '';
    editor.read(() => {
      content = $convertToMarkdownString(MARKDOWN_TRANSFORMERS);
    });
    return content;
  }
  return '';
};

export const formatParagraph = (editor: LexicalEditor) => {
  editor.update(() => {
    $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
    const selection = $getSelection();
    $setBlocksType(selection, () => $createParagraphNode());
  });
};

export const formatBulletList = (editor: LexicalEditor, blockType: string) => {
  if (blockType !== 'bullet') {
    editor.update(() => {
      $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    });
  } else {
    formatParagraph(editor);
  }
};

export const formatNumberedList = (
  editor: LexicalEditor,
  blockType: string,
) => {
  if (blockType !== 'number') {
    editor.update(() => {
      $addUpdateTag(SKIP_SELECTION_FOCUS_TAG);
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    });
  } else {
    formatParagraph(editor);
  }
};

export function getSelectedNode(
  selection: RangeSelection,
): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}

const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??[-+=&;%@.\w_]*#?\w*)?)/,
);
export function validateUrl(url: string): boolean {
  return url === 'https://' || urlRegExp.test(url);
}

export function sanitizeUrl(url: string): string {
  /** A pattern that matches safe  URLs. */
  const SAFE_URL_PATTERN =
    /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^&:/?#]*(?:[/?#]|$))/gi;

  /** A pattern that matches safe data URLs. */
  const DATA_URL_PATTERN =
    /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;

  url = String(url).trim();

  if (url.match(SAFE_URL_PATTERN) || url.match(DATA_URL_PATTERN)) return url;

  return 'https://';
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const VERTICAL_GAP = 10;
const HORIZONTAL_OFFSET = 5;

export function setFloatingElemPositionForLinkEditor(
  targetRect: DOMRect | null,
  floatingElem: HTMLElement,
  anchorElem: HTMLElement,
  verticalGap: number = VERTICAL_GAP,
  horizontalOffset: number = HORIZONTAL_OFFSET,
): void {
  const contentEditableElem = anchorElem.children.item(0) as HTMLElement | null;

  if (targetRect === null || !contentEditableElem) {
    floatingElem.style.opacity = '0';
    floatingElem.style.transform = 'translate(-10000px, -10000px)';
    return;
  }

  const floatingElemRect = floatingElem.getBoundingClientRect();
  const anchorElementRect = anchorElem.getBoundingClientRect();
  const editorScrollerRect = contentEditableElem.getBoundingClientRect();

  let top = targetRect.top - verticalGap;
  let left = targetRect.left - horizontalOffset;

  if (top < editorScrollerRect.top) {
    top += floatingElemRect.height + targetRect.height + verticalGap * 2;
  }

  if (left + floatingElemRect.width > editorScrollerRect.right) {
    left = editorScrollerRect.right - floatingElemRect.width - horizontalOffset;
  }

  top -= anchorElementRect.top;
  left -= anchorElementRect.left;

  floatingElem.style.opacity = '1';
  floatingElem.style.transform = `translate(${left}px, ${top}px)`;
}
export const convertHtmlToMarkdown = (html: string) => {
  const editor = createHeadlessEditor({ namespace: 'html-to-md' });
  importHtml(editor, html);
  return exportMarkdown(editor);
};

export const normalizedEditorContent = (editor: LexicalEditor | null) => {
  const editorContent = editor ? exportHtml(editor) : '';
  return anyRealContentInHtml(editorContent) ? editorContent : '';
};
