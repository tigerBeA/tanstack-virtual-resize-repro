import React from "react";
import { createRoot } from "react-dom/client";
import { useVirtualizer } from "@tanstack/react-virtual";
import "./style.css";

const VIEWPORT_HEIGHT = 300;
const initialMessages = Array.from({ length: 8 }, (_, index) => ({
  id: `m-${index}`,
  height: index === 7 ? VIEWPORT_HEIGHT : 50,
}));

// Keep diagnostics in a sibling so reading the DOM cannot rerender the list.
function ScrollMetrics({ parentRef }) {
  const [metrics, setMetrics] = React.useState(null);

  React.useEffect(() => {
    const element = parentRef.current;
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      setMetrics({ scrollTop, scrollHeight, clientHeight });
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    observer.observe(element.firstElementChild);
    element.addEventListener("scroll", update);
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [parentRef]);

  if (!metrics) return <p>Measuring...</p>;

  const gap = metrics.scrollHeight - metrics.clientHeight - metrics.scrollTop;
  return (
    <div aria-live="polite">
      <p>
        Actual bottom gap: <strong id="bottom-gap">{gap}</strong> px
      </p>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
}

function App() {
  const [messages, setMessages] = React.useState(initialMessages);
  const parentRef = React.useRef(null);
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    getItemKey: (index) => messages[index].id,
    estimateSize: (index) => initialMessages[index].height,
    anchorTo: "end",
    followOnAppend: true,
    scrollEndThreshold: 4,
    overscan: 4,
    directDomUpdates: true,
    useFlushSync: false,
  });

  React.useLayoutEffect(() => {
    virtualizer.scrollToEnd();
  }, [virtualizer]);

  return (
    <main>
      <h1>Previous row resize breaks end anchoring</h1>
      <p>
        <code>@tanstack/react-virtual@3.14.10</code>
      </p>
      <p>
        Wait for a 0 px gap, then click once. Expected: 0 px. Actual: 24 px.
      </p>
      <button
        id="grow-previous"
        onClick={() => {
          setMessages((current) =>
            current.map((message, index) =>
              index === current.length - 2
                ? { ...message, height: message.height + 24 }
                : message,
            ),
          );
        }}
      >
        Grow previous message by 24 px
      </button>
      <div
        ref={parentRef}
        id="scroll-container"
        style={{
          height: VIEWPORT_HEIGHT,
          width: "100%",
          overflow: "auto",
          overflowAnchor: "none",
        }}
      >
        <div
          ref={virtualizer.containerRef}
          style={{ position: "relative", width: "100%" }}
        >
          {virtualizer.getVirtualItems().map((item) => (
            <div
              key={item.key}
              ref={virtualizer.measureElement}
              data-index={item.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
              }}
            >
              <div
                className="message"
                style={{ height: messages[item.index].height }}
              >
                {item.index === messages.length - 1
                  ? "Last message: this row stays 300 px tall."
                  : `Message ${item.key}`}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ScrollMetrics parentRef={parentRef} />
      <p>Reload to reset. The last row never changes size.</p>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
