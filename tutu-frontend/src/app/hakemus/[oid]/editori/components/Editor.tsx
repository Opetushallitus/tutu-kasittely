'use client';
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import {
  BOLD_STAR,
  HIGHLIGHT,
  LINK,
  ORDERED_LIST,
  STRIKETHROUGH,
  UNORDERED_LIST,
} from '@lexical/markdown';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { styled, useTheme } from '@mui/material';
import { LexicalEditor, ParagraphNode } from 'lexical';
import { RefObject } from 'react';

import { ExtendedTextNode } from '@/src/app/hakemus/[oid]/editori/components/ExtendedTextNode';

import { Toolbar } from './Toolbar';

const editorConfig: InitialConfigType = {
  namespace: 'React.js Demo',
  nodes: [ParagraphNode, ExtendedTextNode, ListNode, ListItemNode, LinkNode],
  onError(error: Error) {
    throw error;
  },
  theme: {
    text: {
      strikethrough: 'editor-textStrikethrough',
    },
  },
};

const EditorContainer = styled('div')({
  width: '100%',
  height: '800px',
  border: '1px solid',
  borderColor: 'black',
});

const EditorInnerContainer = styled('div')({
  '& p': {
    marginTop: 0,
  },
  '& .editor-textStrikethrough': {
    textDecoration: 'line-through',
  },
});

export function Editor({
  editorRef,
}: {
  editorRef: RefObject<LexicalEditor | null>;
}) {
  const theme = useTheme();

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <EditorContainer>
        <Toolbar />
        <EditorInnerContainer>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={{
                  padding: theme.spacing(1),
                  outline: 'none',
                  height: '760px',
                  overflow: 'scroll',
                }}
                aria-placeholder={''}
                placeholder={<span>{''}</span>}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </EditorInnerContainer>
      </EditorContainer>
      <HistoryPlugin />
      <ListPlugin />
      <EditorRefPlugin editorRef={editorRef} />
      <MarkdownShortcutPlugin
        transformers={[
          UNORDERED_LIST,
          ORDERED_LIST,
          BOLD_STAR,
          STRIKETHROUGH,
          HIGHLIGHT,
          LINK,
        ]}
      />
    </LexicalComposer>
  );
}
