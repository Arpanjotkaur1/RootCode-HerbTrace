// [KHUSHI] Species classification API wrapper.
//
// NOTE: classification runs client-side in Saanvi's separate frontend repo
// (TF.js/Teachable Machine in the browser, no server round-trip on a spotty
// field connection) -- that classifier code is no longer part of this
// backend at all. This route is a placeholder in case we need a
// server-side fallback (e.g. re-verifying on submit) -- decide during
// integration whether it's actually needed. If not needed, delete this
// route rather than leaving dead code.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "not implemented -- classification runs client-side in Saanvi's frontend repo" }, { status: 501 });
}
