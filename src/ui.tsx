import * as React from "react";
import * as ReactDOM from "react-dom";
import { pluginApi } from "./api";
import "./styles.css";
import { useWindowResize } from "./utils/useWindowResize";
import { data } from "./data";
import { encodeFigma, getImageData, loadImage } from "./utils/utils";
import Tab from "./components/header";

declare function require(path: string): any;

const emojiUrl = `https://raw.githubusercontent.com/JustJordanT/Windows_11_Emjois/main/`;

const App = () => {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState(null);
  const imgRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const onWindowResize = (windowSize: { width: number; height: number }) => {
    pluginApi.setWindowSize(windowSize.width, windowSize.height);
  };
  useWindowResize(onWindowResize, {
    minWidth: 120,
    minHeight: 120,
    maxWidth: 1024,
    maxHeight: 1024,
  });

  const filterData = () => {
    let currentData = data.reverse();
    if (category) {
      currentData = currentData.filter((v) => v.category === category);
    }
    if (search.length > 0) {
      currentData = currentData.filter((v) =>
        v.name.includes(search.toLowerCase())
      );
    }
    return currentData;
  };

  return (
    <div>
      <Tab
        category={category}
        setCategory={setCategory}
        search={search}
        setSearch={setSearch}
      />
      <div className="flex flex-wrap w-full justify-start">
        {filterData().map((item, i) => {
          let imageUrl = `${emojiUrl}/${item.name}`;
          if (item.category !== "general")
            imageUrl = `${emojiUrl}/${item.category}/${item.name}`;
          const setBg = async (dropPosition = null, windowSize = null) => {
            const image = await loadImage(imageUrl, imgRef);
            const { imageData, canvas, context } = getImageData(
              image,
              canvasRef
            );
            const newBytes = await encodeFigma(canvas, context, imageData);
            pluginApi.placeImage(newBytes, dropPosition, windowSize);
          };
          return (
            <div
              key={i}
              className="w-11 h-11 hover:bg-gray-200 rounded-md text-xs overflow-hidden justify-center items-center p-2 cursor-pointer"
              draggable={true}
              onDragEnd={(e: any) => {
                if (e.view.length !== 0) {
                  // Get the position of the cursor relative to the top-left corner of the browser page
                  const dropPosition = {
                    clientX: e.clientX,
                    clientY: e.clientY,
                  };

                  const windowSize = {
                    width: window.outerWidth,
                    height: window.outerHeight,
                  };

                  setBg(dropPosition, windowSize);
                }
              }}
              onClick={() => {
                setBg();
              }}
            >
              <img src={imageUrl} alt={item.name} />
            </div>
          );
        })}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <img ref={imgRef} style={{ display: "none" }} />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("react-page"));
