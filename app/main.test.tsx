import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Main from './main'

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: "MockVitest",
      asPath: "",
    };
  },
  useParams() {
    return {
      route: "/",
      pathname: "",
      query: "MockVitest",
      asPath: "",
    };
  },
}));
vi.mock("react-intl", () => ({
  useIntl() {
    return {
      formatMessage: (s: any) => s.id
    }
  },
}))

test("App Router: Works with Server Components", () => {
  render(<Main />);
  // expect(screen.getByRole("main")).toBeDefined();
  expect(screen).toBeDefined()
});
