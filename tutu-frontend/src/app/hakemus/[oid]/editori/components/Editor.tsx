'use client';
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  AutoLinkNode,
  createLinkMatcherWithRegExp,
  LinkNode,
} from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import {
  BOLD_STAR,
  HIGHLIGHT,
  LINK,
  ORDERED_LIST,
  STRIKETHROUGH,
  UNORDERED_LIST,
} from '@lexical/markdown';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { Box, styled, useTheme } from '@mui/material';
import { LexicalEditor, ParagraphNode } from 'lexical';
import { RefObject, useState } from 'react';

import { validateUrl } from '@/src/app/hakemus/[oid]/editori/components/editor-utils';
import { ExtendedTextNode } from '@/src/app/hakemus/[oid]/editori/components/ExtendedTextNode';
import FloatingLinkEditorPlugin from '@/src/app/hakemus/[oid]/editori/components/FloatingLinkEditorPlugin';

import { Toolbar } from './Toolbar';

const editorConfig: InitialConfigType = {
  namespace: 'React.js Demo',
  nodes: [
    ParagraphNode,
    ExtendedTextNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode,
  ],
  onError(error: Error) {
    throw error;
  },
  theme: {
    text: {
      strikethrough: 'editor-textStrikethrough',
    },
  },
};

const EditorContainer = styled(Box)({
  width: '100%',
  height: '800px',
  border: '1px solid',
  borderRadius: '4px',
  borderColor: 'black',
});

const EditorInnerContainer = styled(Box)({
  '& p': {
    marginTop: 0,
  },
  '& .editor-textStrikethrough': {
    textDecoration: 'line-through',
  },
});

const URL_REGEX =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(?<![-.+():%])/;

const MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX, (text) => {
    return text.startsWith('http') ? text : `https://${text}`;
  }),
];

export function Editor({
  editorRef,
  onChange,
}: {
  editorRef: RefObject<LexicalEditor | null>;
  onChange: (editor: LexicalEditor) => void;
}) {
  const theme = useTheme();

  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement | null) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <EditorContainer>
        <Toolbar setIsLinkEditMode={setIsLinkEditMode} />
        <EditorInnerContainer>
          <RichTextPlugin
            contentEditable={
              <Box
                style={{
                  height: '760px',
                  overflow: 'scroll',
                }}
              >
                <Box
                  ref={onRef}
                  style={{
                    position: 'relative',
                    height: '100%',
                  }}
                >
                  <ContentEditable
                    data-testid={'editor-content-editable'}
                    name={'editor-content-editable'}
                    style={{
                      padding: theme.spacing(1),
                      outline: 'none',
                      height: '100%',
                    }}
                    aria-placeholder={''}
                    placeholder={<span>{''}</span>}
                  />
                </Box>
              </Box>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </EditorInnerContainer>
      </EditorContainer>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin validateUrl={validateUrl} />
      <AutoLinkPlugin matchers={MATCHERS} />
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
      <OnChangePlugin
        onChange={(_state, editor) => {
          onChange(editor);
        }}
      />
      <>
        {floatingAnchorElem && (
          <FloatingLinkEditorPlugin
            anchorElem={floatingAnchorElem}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
          />
        )}
      </>
    </LexicalComposer>
  );
}
