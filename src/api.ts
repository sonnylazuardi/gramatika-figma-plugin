import { createPluginAPI, createUIAPI } from "figma-jsonrpc";

let nodes = [];

const traverseNode = (node: any) => {
  if (node.children) {
    node.children.forEach((nodeChild) => traverseNode(nodeChild));
  }
  nodes.push(node.id);
};

export const pluginApi = createPluginAPI({
  getCommand() {
    return figma.command;
  },
  setStorage(key: string, value: string) {
    return figma.clientStorage.setAsync(key, value);
  },
  setWindowSize(width: number, height: number) {
    return figma.ui.resize(width, height)
  },
  notify(message: string) {
    figma.notify(message);
  },
  placeSvg(svg: any) {
    const page = figma.currentPage;
    let node = figma.createNodeFromSvg(svg);
    if (!node) {
      console.log('Import failed: invalid SVG');
      return;
    }
    page.appendChild(node)
  },
  getRelaunch() {
    return figma.root.getPluginData('fileKey');
  },
  getSelections() {
    nodes = [];
    const select = figma.currentPage.selection[0];
    if (select) {
      traverseNode(select);
    }
    return nodes;
  },
  placeImage(newBytes, dropPosition, windowSize) {
    let node = figma.createRectangle();
    node.resize(40, 40);
    figma.currentPage.appendChild(node);
    figma.notify('Added to canvas');

    const newFills = []
    //@ts-ignore
    for (const paint of node.fills) {
      const newPaint = JSON.parse(JSON.stringify(paint))
      newPaint.blendMode = "NORMAL"
      newPaint.filters = {
        contrast: 0,
        exposure: 0,
        highlights: 0,
        saturation: 0,
        shadows: 0,
        temperature: 0,
        tint: 0,
      }
      newPaint.imageTransform = [
        [1, 0, 0],
        [0, 1, 0]
      ]
      newPaint.opacity = 1
      newPaint.scaleMode = "FILL"
      newPaint.scalingFactor = 0.5
      newPaint.visible = true
      newPaint.type = "IMAGE"
      delete newPaint.color
      newPaint.imageHash = figma.createImage(newBytes).hash
      newFills.push(newPaint)
    }
    //@ts-ignore
    node.fills = newFills

    if (dropPosition) {
      const bounds = figma.viewport.bounds;
      const zoom = figma.viewport.zoom;

      // Math.round is used here because sometimes it may return a floating point number very close but not exactly the window width.
      const hasUI = Math.round(bounds.width * zoom) !== windowSize.width;

      const leftPaneWidth = windowSize.width - bounds.width * zoom - 240;
      const xFromCanvas = hasUI ? dropPosition.clientX - leftPaneWidth : dropPosition.clientX;
      const yFromCanvas = hasUI ? dropPosition.clientY - 40 : dropPosition.clientY;


      node.x = bounds.x + xFromCanvas / zoom - node.width / 2;
      node.y = bounds.y + yFromCanvas / zoom - node.height / 2;
    } else {
      node.x = figma.viewport.center.x - node.width / 2;
      node.y = figma.viewport.center.y - -(node.height / 2);
    }

    figma.currentPage.selection = [node];

    return;
  }
})

let eventCallback = {
  selectionChanged: (selection) => {},
  pageChanged: (page) => {}
}

export const setEventCallback = (name: string, callback: Function) => {
  eventCallback[name] = callback;
}

export const uiApi = createUIAPI({
  selectionChanged(selection) {
    nodes = [];
    eventCallback.selectionChanged(selection.map((item) => item.id))
  },
  pageChanged(page) {
    eventCallback.pageChanged(page)
  }
});