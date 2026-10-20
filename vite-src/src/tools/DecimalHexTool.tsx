import { useState } from "react";
import { ArrowLeftRight, Copy, RotateCcw, Check } from "lucide-react";

type Mode = "decimal-to-hex" | "hex-to-decimal";

export default function DecimalHexTool() {
  const [mode, setMode] = useState<Mode>("decimal-to-hex");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const isDecimalToHex = mode === "decimal-to-hex";

  const result = (() => {
    const value = input.trim();

    if (!value) return { value: "", error: "" };

    try {
      if (isDecimalToHex) {
        if (!/^[+-]?\d+$/.test(value)) {
          return {
            value: "",
            error: "لطفاً یک عدد صحیح معتبر وارد کنید.",
          };
        }

        return {
          value: BigInt(value).toString(16).toUpperCase(),
          error: "",
        };
      }

      if (!/^[+-]?(?:0x)?[0-9a-f]+$/i.test(value)) {
        return {
          value: "",
          error: "ورودی هگزادسیمال معتبر نیست.",
        };
      }

      const negative = value.startsWith("-");
      const normalized = value.replace(/^[+-]/, "").replace(/^0x/i, "");
      const decimal = BigInt(`0x${normalized}`);

      return {
        value: (negative ? -decimal : decimal).toString(10),
        error: "",
      };
    } catch {
      return { value: "", error: "تبدیل این مقدار امکان‌پذیر نیست." };
    }
  })();

  async function copyResult() {
    if (!result.value) return;

    try {
      await navigator.clipboard.writeText(result.value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function reset() {
    setInput("");
    setCopied(false);
  }

  function switchMode() {
    setMode((current) =>
      current === "decimal-to-hex"
        ? "hex-to-decimal"
        : "decimal-to-hex"
    );
    setInput("");
    setCopied(false);
  }

  return (
    <div className="tool-page">
      <div className="tool-heading">
        <div>
          <div className="tool-eyebrow">NUMBER CONVERTER</div>
          <h1>Decimal ↔ Hex</h1>
          <p>تبدیل اعداد ده‌دهی و هگزادسیمال به یکدیگر</p>
        </div>

        <button
          className="icon-button"
          onClick={reset}
          title="پاک کردن ورودی"
          aria-label="پاک کردن ورودی"
        >
          <RotateCcw size={17} />
        </button>
      </div>

      <div className="tool-card">
        <div className="tool-card-header">
          <span className="field-label">حالت تبدیل</span>

          <button className="switch-mode-button" onClick={switchMode}>
            <ArrowLeftRight size={15} />
            جابه‌جایی حالت
          </button>
        </div>

        <div className="conversion-tabs">
          <button
            className={isDecimalToHex ? "conversion-tab active" : "conversion-tab"}
            onClick={() => {
              setMode("decimal-to-hex");
              reset();
            }}
          >
            Decimal <span>→</span> Hex
          </button>

          <button
            className={!isDecimalToHex ? "conversion-tab active" : "conversion-tab"}
            onClick={() => {
              setMode("hex-to-decimal");
              reset();
            }}
          >
            Hex <span>→</span> Decimal
          </button>
        </div>

        <div className="converter-fields">
          <div className="converter-field">
            <label className="field-label" htmlFor="converter-input">
              {isDecimalToHex ? "عدد ده‌دهی (Decimal)" : "عدد هگزادسیمال (Hex)"}
            </label>

            <input
              id="converter-input"
              className="converter-input"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setCopied(false);
              }}
              placeholder={isDecimalToHex ? "مثلاً 255" : "مثلاً FF یا 0xFF"}
              spellCheck={false}
              autoComplete="off"
              autoFocus
            />

            <span className="field-hint">
              {isDecimalToHex
                ? "عدد صحیح مثبت یا منفی وارد کنید."
                : "از ارقام 0–9 و حروف A–F استفاده کنید."}
            </span>
          </div>

          <div className="result-arrow">
            <ArrowLeftRight size={18} />
          </div>

          <div className="converter-field">
            <label className="field-label">نتیجه</label>

            <div className="result-box">
              <code dir="ltr">{result.value || "—"}</code>

              <button
                className="icon-button result-copy"
                onClick={copyResult}
                disabled={!result.value}
                title="کپی نتیجه"
                aria-label="کپی نتیجه"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <span className={`field-hint ${result.error ? "error-text" : ""}`}>
              {result.error ||
                (result.value
                  ? copied
                    ? "نتیجه کپی شد."
                    : "تبدیل با موفقیت انجام شد."
                  : "نتیجه اینجا نمایش داده می‌شود.")}
            </span>
          </div>
        </div>

        <div className="tool-card-footer">
          <span>پردازش محلی · بدون ارسال اطلاعات</span>
          <span>Integer / BigInt</span>
        </div>
      </div>

      <div className="examples-section">
        <h2>مثال‌های سریع</h2>

        <div className="example-list">
          {(isDecimalToHex
            ? [
                ["10", "A"],
                ["255", "FF"],
                ["4096", "1000"],
                ["65535", "FFFF"],
              ]
            : [
                ["A", "10"],
                ["FF", "255"],
                ["1000", "4096"],
                ["FFFF", "65535"],
              ]
          ).map(([sample, expected]) => (
            <button
              key={sample}
              className="example-item"
              onClick={() => setInput(sample)}
            >
              <code dir="ltr">{sample}</code>
              <ArrowLeftRight size={14} />
              <code dir="ltr">{expected}</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
