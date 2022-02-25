/* global figma, __html__*/

figma.showUI(__html__, { width: 340, height: 220 });

figma.ui.onmessage = async msg => {
  if (msg.type === 'check-text') {
    if (figma.currentPage.selection.length === 0) {
      figma.ui.postMessage({ text: '' });
    }

    figma.currentPage.selection.forEach(node => {
      try {
        //@ts-ignore
        if (node.characters && node.characters.length) {
          //@ts-ignore
          const text: string = node.characters;
          figma.ui.postMessage({ text, id: node.id });
        }
        node
          //@ts-ignore
          .findAll(n => n.characters && n.characters.length)
          .forEach(item => {
            //@ts-ignore
            if (item.characters) {
              //@ts-ignore
              const text: string = item.characters;
              figma.ui.postMessage({ text, id: item.id });
            }
          });
      } catch (e) {
        //do nothing
      }
    });
  }

  if (msg.type === 'replace-text') {
    const node = figma.getNodeById(msg.id);
    //@ts-ignore
    const font = node.getRangeFontName(0, node.characters.length);
    //@ts-ignore
    figma.loadFontAsync(font);
    setTimeout(() => {
      //@ts-ignore
      if (node.characters) {
        //@ts-ignore
        node.characters = node.characters.replace(msg.old, msg.new);
      }
    }, 500);
  }

  if (msg.type === 'zoom-to-node') {
    const node = figma.getNodeById(msg.id);
    //@ts-ignore
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
  }
};
