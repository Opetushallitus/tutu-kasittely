'use client';
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $isLinkNode } from '@lexical/link';
import { $isListNode, ListNode, ListType } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $patchStyleText } from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  DeleteOutlined,
  FormatBold,
  FormatListBulleted,
  FormatListNumbered,
  FormatStrikethrough,
  Highlight,
  LinkOutlined,
  Redo,
  Undo,
} from '@mui/icons-material';
import { Divider, Stack, styled } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalNode,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ColorPicker,
  FontColor,
} from '@/src/app/hakemus/[oid]/editori/components/ColorPicker';
import {
  formatBulletList,
  formatNumberedList,
  getSelectedNode,
} from '@/src/app/hakemus/[oid]/editori/components/editor-utils';

const ToolbarContainer = styled(Stack)({
  width: '100%',
  height: '40px',
  borderBottom: '1px solid',
  borderColor: 'black',
});

const ToolbarInnerContainer = styled(Stack)({
  padding: '4px 0',
});

const iconStyle = (selected: boolean) => ({
  color: selected ? ophColors.black : ophColors.grey700,
  backgroundColor: selected ? ophColors.grey200 : ophColors.white,
  borderRadius: '2px',
});

type BlockType = ListType | 'paragraph';

const initialState = {
  isBold: false,
  isStrikethrough: false,
  isHighlighted: false,
  fontColor: ophColors.black as FontColor,
  canUndo: false,
  canRedo: false,
  isLink: false,
  blockType: 'paragraph' as BlockType,
};

type ToolbarState = typeof initialState;
type ToolbarStateKey = keyof ToolbarState;
type ToolbarStateValue<Key extends ToolbarStateKey> = ToolbarState[Key];

function $findTopLevelElement(node: LexicalNode) {
  let topLevelElement =
    node.getKey() === 'root'
      ? node
      : $findMatchingParent(node, (e) => {
          const parent = e.getParent();
          return parent !== null && $isRootOrShadowRoot(parent);
        });

  if (topLevelElement === null) {
    topLevelElement = node.getTopLevelElementOrThrow();
  }
  return topLevelElement;
}

export function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [toolbarState, setToolbarState] = useState<ToolbarState>(initialState);

  const updateToolbarState = <Key extends ToolbarStateKey>(
    key: Key,
    value: ToolbarStateValue<Key>,
  ) => {
    setToolbarState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      updateToolbarState('isBold', selection.hasFormat('bold'));
      updateToolbarState(
        'isStrikethrough',
        selection.hasFormat('strikethrough'),
      );
      updateToolbarState('isHighlighted', selection.hasFormat('highlight'));

      const anchorNode = selection.anchor.getNode();
      const element = $findTopLevelElement(anchorNode);
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const isLink = $isLinkNode(parent) || $isLinkNode(node);
      updateToolbarState('isLink', isLink);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();

          updateToolbarState('blockType', type);
        } else {
          updateToolbarState('blockType', 'paragraph');
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => {
            $updateToolbar();
          },
          { editor },
        );
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          updateToolbarState('canUndo', payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          updateToolbarState('canRedo', payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, $updateToolbar]);

  const clearFormatting = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if ($isTextNode(node)) {
            node.setFormat(0);
            node.setStyle('');
          }
        });
      }
    });
  };

  const changeFontColor = useCallback(
    (value: FontColor) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, { color: value });
        }
      });
    },
    [editor],
  );

  return (
    <ToolbarContainer
      direction={'row'}
      ref={toolbarRef}
      divider={<Divider orientation={'vertical'} flexItem />}
      alignContent={'center'}
    >
      <ToolbarInnerContainer direction={'row'}>
        <OphButton
          disabled={!toolbarState.canUndo}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          aria-label="Format Bold"
          startIcon={
            <Undo
              style={{
                color: toolbarState.canUndo
                  ? ophColors.black
                  : ophColors.grey400,
              }}
            />
          }
        />
        <OphButton
          disabled={!toolbarState.canRedo}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }}
          aria-label="Format Bold"
          startIcon={
            <Redo
              style={{
                color: toolbarState.canRedo
                  ? ophColors.black
                  : ophColors.grey400,
              }}
            />
          }
        />
      </ToolbarInnerContainer>
      <ToolbarInnerContainer direction={'row'}>
        <OphButton
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
          }}
          aria-label="Format Bold"
          startIcon={<FormatBold style={iconStyle(toolbarState.isBold)} />}
        />
        <OphButton
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight');
          }}
          aria-label="Format highlight"
          startIcon={
            <Highlight style={iconStyle(toolbarState.isHighlighted)} />
          }
        />
        <OphButton
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
          }}
          aria-label="Format strikethrough"
          startIcon={
            <FormatStrikethrough
              style={iconStyle(toolbarState.isStrikethrough)}
            />
          }
        />
        <ColorPicker changeFontColor={changeFontColor} />
        <OphButton
          onClick={clearFormatting}
          aria-label="Clear formatting"
          startIcon={<DeleteOutlined style={{ color: ophColors.black }} />}
        />
      </ToolbarInnerContainer>
      <ToolbarInnerContainer direction={'row'}>
        <OphButton
          onClick={() => formatBulletList(editor, toolbarState.blockType)}
          aria-label="List Bulleted"
          startIcon={
            <FormatListBulleted
              style={iconStyle(toolbarState.blockType === 'bullet')}
            />
          }
        />
        <OphButton
          onClick={() => formatNumberedList(editor, toolbarState.blockType)}
          aria-label="List Numbered"
          startIcon={
            <FormatListNumbered
              style={iconStyle(toolbarState.blockType === 'number')}
            />
          }
        />
      </ToolbarInnerContainer>
      <ToolbarInnerContainer direction={'row'}>
        <OphButton
          onClick={() => {}}
          aria-label="Add link"
          startIcon={<LinkOutlined style={iconStyle(toolbarState.isLink)} />}
        />
      </ToolbarInnerContainer>
    </ToolbarContainer>
  );
}
