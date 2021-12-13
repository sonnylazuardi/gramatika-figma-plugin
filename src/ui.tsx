import * as React from "react";
import * as ReactDOM from "react-dom";
import "./ui.css";
//@ts-ignore
const entries = require("./entries.json");
const baku = require("./baku.json");
const LeftChevron = require("./left-chevron.svg");
const RightChevron = require("./right-chevron.svg");
const Lottie = require("react-lottie").default;
const searchingAnim = require("./searching.json");
const doneAnim = require("./done.json");

const entriesFuse = entries.map((item) => ({ text: item }));

const Fuse = require("fuse.js");

declare function require(path: string): any;

const getBasicWord = (word) => {
  const affixMap = [
    "mem",
    "meng",
    "men",
    "me",
    "di",
    "ku",
    "ter",
    "per",
    "pel",
    "pen",
    "ber",
  ];
  const postfixMap = ["kan", "an", "nya", "ku", "mu", "i"];
  let result = word;
  affixMap.forEach((affix) => {
    if (word.indexOf(affix) === 0) {
      result = result.replace(affix, "");
    }
  });
  let found = false;
  postfixMap.forEach((postfix) => {
    if (
      (word.length - word.indexOf(postfix) === postfix.length ||
        postfix.length <= 1) &&
      !found
    ) {
      found = true;
      const wordReverse = result
        .split("")
        .reverse()
        .join("");
      let postfixReverse = postfix;
      if (postfix.length > 1) {
        postfixReverse = postfix
          .split("")
          .reverse()
          .join("");
      }
      result = wordReverse
        .replace(postfixReverse, "")
        .split("")
        .reverse()
        .join("");
    }
  });
  return result;
};

function isNumber(n: any) {
  return !isNaN(parseFloat(n)) && !isNaN(n - 0);
}

function App() {
  const [correction, setCorrection] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(true);
  const [isEmpty, setIsEmpty] = React.useState(false);
  const [indexActive, setIndexActive] = React.useState(0);

  const check = () => {
    parent.postMessage({ pluginMessage: { type: "check-text" } }, "*");
  };

  React.useEffect(() => {
    check();
  }, []);

  React.useEffect(() => {
    if (correction && correction.length > 0) {
      parent.postMessage(
        { pluginMessage: { type: "zoom-to-node", id: correction[0].id } },
        "*"
      );
    }
  }, [correction]);

  window.onmessage = (event: any) => {
    let message = event.data.pluginMessage;

    setIsSearching(true);
    setIsEmpty(false);

    const { text, id } = message;

    if (text === "") setIsEmpty(true);

    let myText = text.replace(/\n/g, " ");
    myText = myText.replace(/\./g, " ");
    const tokenizer = myText.split(" ");
    tokenizer.forEach((currentText: string) => {
      if (currentText !== "") {
        const oldText = currentText.replace(/[^a-zA-Z0-9\-]/g, "");
        currentText = currentText.replace(/[^a-zA-Z0-9\-]/g, "");
        currentText = currentText.toLowerCase();

        if (baku[currentText]) {
          setCorrection((oldCorrection) => [
            ...oldCorrection,
            {
              id,
              old: oldText,
              new: baku[currentText],
              alt: [baku[currentText]],
            },
          ]);
        } else if (
          entries.find(
            (item) => item === currentText || item === getBasicWord(currentText)
          )
        ) {
          // console.log(`${currentText} ==> NO CHANGE`);
        } else if (isNumber(currentText)) {
          // do nothing
        } else {
          const filteredEntries = entriesFuse.filter(
            (item) => item.text[0] === currentText[0]
          );
          const fuse = new Fuse(filteredEntries, {
            keys: ["text"],
            id: "text",
            shouldSort: true,
            threshold: 0.3,
          });
          setTimeout(() => {
            const results = fuse.search(currentText);
            // console.log(`${currentText} ==> `, results[0]);
            if (oldText.trim() !== "") {
              setCorrection((oldCorrection) => [
                ...oldCorrection,
                {
                  old: oldText,
                  id,
                  new: results[0],
                  alt: results.filter((_, i) => i <= 20),
                },
              ]);
            }
          });
        }
      }
    });

    setTimeout(() => setIsSearching(false), 500);
  };

  const nextText = () => {
    setIndexActive(0);
    setCorrection([...correction.slice(0, 0), ...correction.slice(0 + 1)]);
  };

  const options = (animationData, loop) => ({
    loop,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  });

  const accept = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "replace-text",
          id: correction[0].id,
          old: correction[0].old,
          new: correction[0].alt[indexActive],
        },
      },
      "*"
    );
    nextText();
  };

  return (
    <div className="App">
      {isEmpty ? (
        <div>
          <div className="center">Pilih teks lalu tekan cek</div>
          <div className="actions">
            <button onClick={() => check()}>Cek Teks</button>
          </div>
        </div>
      ) : isSearching ? (
        <div>
          <Lottie
            options={options(searchingAnim, true)}
            height={90}
            width={200}
          />
          <div className="center">Mengecek ejaan dalam teks yang dipilih</div>
          <div className="actions">
            <button onClick={() => {}}>Batalkan</button>
          </div>
        </div>
      ) : correction.length > 0 ? (
        <div>
          <div className="old">
            Ubah <span className="old-bold">{correction[0].old}</span> menjadi:
          </div>
          <div className="new">
            <button className="btn-new large" onClick={() => accept()}>
              {correction[0].alt[indexActive]}
            </button>
          </div>
          <div className="chevrons">
            <a
              onClick={() => {
                let nextIndex = indexActive - 1;
                if (nextIndex < 0) {
                  nextIndex = correction[0].alt.length - 1;
                }
                setIndexActive(nextIndex);
              }}
            >
              <img src={LeftChevron} className="icon-arrow" />
            </a>
            <a
              onClick={() => {
                let nextIndex = indexActive + 1;
                if (nextIndex >= correction[0].alt.length - 1) {
                  nextIndex = 0;
                }
                setIndexActive(nextIndex);
              }}
            >
              <img src={RightChevron} className="icon-arrow" />
            </a>
          </div>
          <div className="actions">
            <button className="primary" onClick={() => accept()}>
              Ubah
            </button>
            <button onClick={() => nextText()}>Lewati</button>
          </div>
        </div>
      ) : (
        <div>
          <Lottie options={options(doneAnim, false)} height={90} width={200} />
          <div className="center">Teks sudah selesai dicek</div>
          <div className="actions">
            <button onClick={() => check()}>Cek Lagi</button>
          </div>
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById("react-page");
ReactDOM.render(<App />, rootElement);
