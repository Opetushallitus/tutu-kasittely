import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
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
// import {$isAtNodeEnd} from "@lexical/selection";

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
      content = $convertToMarkdownString(TRANSFORMERS);
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
