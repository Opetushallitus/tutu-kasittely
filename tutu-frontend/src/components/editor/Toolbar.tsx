'use client';
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isListNode, ListNode, ListType } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  Add,
  FormatBold,
  FormatClear,
  FormatListBulleted,
  FormatListNumbered,
  HighlightOutlined,
  LinkOutlined,
  Redo,
  StrikethroughS,
  Undo,
} from '@mui/icons-material';
import { Divider, Stack, styled } from '@mui/material';
import { alpha, rgbToHex } from '@mui/system';
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

import { ColorPicker, FontColor } from '@/src/components/editor/ColorPicker';
import {
  formatBulletList,
  formatNumberedList,
  getSelectedNode,
  sanitizeUrl,
} from '@/src/components/editor/editor-utils';
import ValitsePohjaProps from '@/src/components/editor/ValitsePohjaProps';

const ToolbarRow = styled(Stack)({
  width: '100%',
  height: '36px',
  borderBottom: '1px solid',
  borderColor: 'black',
});

const ToolbarContainer = styled(Stack)({});

const ToolbarInnerContainer = styled(Stack)({
  padding: '0',
  display: 'flex',
  alignItems: 'center',
});

const iconStyle = (selected: boolean) => ({
  color: selected ? ophColors.grey900 : ophColors.grey700,
});

const buttonStyle = (selected: boolean) => ({
  backgroundColor: selected
    ? alpha(ophColors.lightBlue2, 0.5)
    : ophColors.white,
  '&:hover': {
    backgroundColor: ophColors.grey100,
  },
  height: '34px',
  width: '40px',
  padding: '1px',
  margin: 0,
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

type BlockType = ListType | 'paragraph';

const initialState = {
  isBold: false,
  isStrikethrough: false,
  isHighlighted: false,
  fontColor: ophColors.grey900 as FontColor,
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

export function Toolbar({
  setIsLinkEditMode,
  valitsePohjaProps,
}: {
  setIsLinkEditMode: (isLinkEditMode: boolean) => void;
  valitsePohjaProps?: ValitsePohjaProps;
}) {
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

      const selectionColor = $getSelectionStyleValueForProperty(
        selection,
        'color',
        ophColors.grey900,
      );
      updateToolbarState(
        'fontColor',
        selectionColor === '' ? '' : (rgbToHex(selectionColor) as FontColor),
      );

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
      updateToolbarState('fontColor', value);
    },
    [editor],
  );

  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, toolbarState.isLink, setIsLinkEditMode]);

  return (
    <ToolbarRow direction={'row'} justifyContent="space-between">
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
            aria-label="Undo"
            sx={buttonStyle(false)}
            startIcon={
              <Undo
                sx={{
                  fontSize: '24px',
                  color: toolbarState.canUndo
                    ? ophColors.grey900
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
            aria-label="Redo"
            sx={buttonStyle(false)}
            startIcon={
              <Redo
                sx={{
                  fontSize: '24px',
                  color: toolbarState.canRedo
                    ? ophColors.grey900
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
            sx={buttonStyle(toolbarState.isBold)}
            startIcon={<FormatBold sx={iconStyle(toolbarState.isBold)} />}
          />
          <OphButton
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight');
            }}
            aria-label="Format highlight"
            sx={buttonStyle(toolbarState.isHighlighted)}
            startIcon={
              <HighlightOutlined sx={iconStyle(toolbarState.isHighlighted)} />
            }
          />
          <OphButton
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
            }}
            aria-label="Format strikethrough"
            sx={buttonStyle(toolbarState.isStrikethrough)}
            startIcon={
              <StrikethroughS sx={iconStyle(toolbarState.isStrikethrough)} />
            }
          />
          <ColorPicker
            changeFontColor={changeFontColor}
            selectedColor={toolbarState.fontColor}
          />
          <OphButton
            onClick={clearFormatting}
            aria-label="Clear formatting"
            sx={buttonStyle(false)}
            startIcon={<FormatClear sx={iconStyle(false)} />}
          />
        </ToolbarInnerContainer>
        <ToolbarInnerContainer direction={'row'}>
          <OphButton
            onClick={() => formatBulletList(editor, toolbarState.blockType)}
            aria-label="List Bulleted"
            sx={buttonStyle(toolbarState.blockType === 'bullet')}
            startIcon={
              <FormatListBulleted
                sx={iconStyle(toolbarState.blockType === 'bullet')}
              />
            }
          />
          <OphButton
            onClick={() => formatNumberedList(editor, toolbarState.blockType)}
            aria-label="List Numbered"
            sx={buttonStyle(toolbarState.blockType === 'number')}
            startIcon={
              <FormatListNumbered
                sx={iconStyle(toolbarState.blockType === 'number')}
              />
            }
          />
        </ToolbarInnerContainer>
        <ToolbarInnerContainer direction={'row'}>
          <OphButton
            onClick={insertLink}
            aria-label="Add link"
            sx={buttonStyle(toolbarState.isLink)}
            startIcon={<LinkOutlined sx={iconStyle(toolbarState.isLink)} />}
          />
        </ToolbarInnerContainer>
      </ToolbarContainer>
      {valitsePohjaProps && valitsePohjaProps.showButton && (
        <OphButton
          variant="text"
          data-testid={'add-tekstipohja-button'}
          startIcon={<Add />}
          onClick={() => {
            valitsePohjaProps.onValitsePohja();
          }}
        >
          {valitsePohjaProps.buttonText}
        </OphButton>
      )}
    </ToolbarRow>
  );
}
