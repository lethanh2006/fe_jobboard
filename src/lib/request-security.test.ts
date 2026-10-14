import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isTrustedMutation } from "./request-security.ts";

/** Server standalone trong Docker nhìn thấy URL với địa chỉ bind, không phải host của trình duyệt. */
const post = (headers: Record<string, string>, url = "http://0.0.0.0:3000/api/auth/login") =>
  new Request(url, { method: "POST", headers });

describe("isTrustedMutation", () => {
  it("nhận yêu cầu cùng origin từ trình duyệt dù request.url mang địa chỉ bind của server", () => {
    assert.equal(
      isTrustedMutation(
        post({ origin: "http://localhost:3100", host: "localhost:3100", "sec-fetch-site": "same-origin" }),
      ),
      true,
    );
  });

  it("từ chối yêu cầu từ trang khác, có hoặc không có Sec-Fetch-Site", () => {
    const crossSite = { origin: "https://evil.example", host: "app.example.com" };

    assert.equal(isTrustedMutation(post({ ...crossSite, "sec-fetch-site": "cross-site" })), false);
    assert.equal(isTrustedMutation(post(crossSite)), false);
  });

  it("từ chối cả same-site (khác origin nhưng cùng site) và Origin: null", () => {
    assert.equal(
      isTrustedMutation(
        post({ origin: "https://other.example.com", host: "app.example.com", "sec-fetch-site": "same-site" }),
      ),
      false,
    );
    assert.equal(isTrustedMutation(post({ origin: "null", host: "app.example.com" })), false);
  });

  it("từ chối Sec-Fetch-Site không phải cùng origin ngay cả khi Origin trùng host", () => {
    assert.equal(
      isTrustedMutation(
        post({ origin: "https://app.example.com", host: "app.example.com", "sec-fetch-site": "same-site" }),
      ),
      false,
    );
  });

  it("nhận yêu cầu không có Origin (curl, server-to-server, điều hướng gõ tay)", () => {
    assert.equal(isTrustedMutation(post({})), true);
    assert.equal(isTrustedMutation(post({ "sec-fetch-site": "none" })), true);
  });

  it("sau reverse proxy dùng X-Forwarded-Host (phần tử đầu) thay vì Host nội bộ", () => {
    const behindProxy = { host: "web:3000", "x-forwarded-host": "www.example.com, edge.internal" };

    assert.equal(isTrustedMutation(post({ ...behindProxy, origin: "https://www.example.com" })), true);
    assert.equal(isTrustedMutation(post({ ...behindProxy, origin: "https://evil.example" })), false);
  });

  it("không có Host thì so với host trong request.url", () => {
    assert.equal(
      isTrustedMutation(post({ origin: "http://localhost:3000" }, "http://localhost:3000/api/x")),
      true,
    );
    assert.equal(
      isTrustedMutation(post({ origin: "http://localhost:4000" }, "http://localhost:3000/api/x")),
      false,
    );
  });
});
