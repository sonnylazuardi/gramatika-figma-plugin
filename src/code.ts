figma.showUI(__html__, { width: 375, height: 600 });

import * as api from './api'

figma.on("selectionchange", () => {
  api.uiApi.selectionChanged(figma.currentPage.selection);
});

figma.on("currentpagechange", () => {
  api.uiApi.pageChanged(figma.currentPage);
});