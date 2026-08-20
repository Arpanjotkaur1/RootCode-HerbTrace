// [KHUSHI] Species classification API wrapper.
//
// NOTE: the plan is to run classification client-side (src/lib/species-classifier.ts,
// already built, using TF.js/Teachable Machine in the browser) so there's no
// server round-trip on a spotty field connection. This route is a placeholder
// in case we need a server-side fallback (e.g. re-verifying on submit) --
// decide during integration whether it's actually needed. If not needed,
// delete this route rather than leaving dead code.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "not implemented -- classification currently runs client-side, see src/lib/species-classifier.ts" }, { status: 501 });
}
