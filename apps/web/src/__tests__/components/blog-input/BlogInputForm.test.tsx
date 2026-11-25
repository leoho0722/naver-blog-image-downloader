import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BlogInputForm from "../../../components/blog-input/BlogInputForm";
import FetchProgress from "../../../components/blog-input/FetchProgress";
import {
  useBlogInputStore,
  type FetchError,
} from "../../../lib/stores/use-blog-input-store";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function getUrlInput() {
  return screen.getByRole("textbox", { name: "blogInputUrlLabel" });
}

describe("BlogInputForm 無障礙", () => {
  beforeEach(() => {
    useBlogInputStore.getState().reset();
  });

  // spectra-scenario: web-blog-input / Input has a programmatic label
  it("網址輸入框以 blogInputUrlLabel 命名，placeholder 只當格式提示", () => {
    render(<BlogInputForm />);

    const input = getUrlInput();
    expect(input).toHaveAttribute("placeholder", "blogInputUrlHint");
    expect(input).toHaveAttribute("name", "blogUrl");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("autocapitalize", "none");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("spellcheck", "false");
    expect(input).toHaveAttribute("enterkeyhint", "go");
  });

  it("貼上按鈕不帶與可見文字重複的 aria-label", () => {
    render(<BlogInputForm />);

    const paste = screen.getByRole("button", { name: "blogInputPaste" });
    expect(paste).not.toHaveAttribute("aria-label");
  });

  // spectra-scenario: web-blog-input / App validation replaces the native bubble
  it("送出不含 https:// 的網址時，顯示 App 的錯誤訊息而非瀏覽器原生提示", async () => {
    const user = userEvent.setup();
    const { container } = render(<BlogInputForm />);
    expect(container.querySelector("form")).toHaveAttribute("novalidate");

    await user.type(getUrlInput(), "blog.naver.com/user/1");
    await user.click(
      screen.getByRole("button", { name: "blogInputFetchButton" }),
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("errorInvalidUrl");
    const input = getUrlInput();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", alert.id);
  });

  // spectra-scenario: web-blog-input / App validation replaces the native bubble / error type to input state
  it.each([
    ["emptyUrl", "true", true],
    ["invalidUrl", "true", true],
    ["networkError", null, true],
    [null, null, false],
  ] as const)(
    "錯誤類型 %s：aria-invalid=%s、是否以 aria-describedby 關聯訊息=%s",
    (type, ariaInvalid, described) => {
      render(<BlogInputForm />);
      act(() => {
        useBlogInputStore.setState({
          error: type ? ({ type } as FetchError) : null,
          fetchPhase: type ? "error" : "idle",
        });
      });

      const input = getUrlInput();
      if (ariaInvalid === null)
        expect(input).not.toHaveAttribute("aria-invalid");
      else expect(input).toHaveAttribute("aria-invalid", ariaInvalid);

      if (described) {
        expect(input).toHaveAttribute(
          "aria-describedby",
          screen.getByRole("alert").id,
        );
      } else {
        expect(input).not.toHaveAttribute("aria-describedby");
        expect(screen.queryByRole("alert")).toBeNull();
      }
    },
  );
});

describe("FetchProgress 步驟語意", () => {
  // spectra-scenario: web-blog-input / Current step is announced
  it("處理中時第二個步驟標上 aria-current=step，其餘不標", () => {
    render(<FetchProgress phase="processing" />);

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[2]).not.toHaveAttribute("aria-current");
  });
});
