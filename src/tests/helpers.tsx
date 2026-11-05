import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import messages from "../../messages/pt.json";

export function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}
