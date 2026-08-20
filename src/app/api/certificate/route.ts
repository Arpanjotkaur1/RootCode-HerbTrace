// [MANSI] Certificate PDF generation endpoint.
//
// What this is for: builds and returns a downloadable PDF certificate for a
// batch, using @react-pdf/renderer.
//
// Depends on:
// - src/app/api/batches/route.ts (Khushi) -- to fetch the batch + harvester.
// - src/data/certificateTemplate.ts (Mansi) -- field list + disclaimer.
// - src/lib/types.ts -- CertificateData type.
//
// Returns: GET ?batchId=... returns a PDF binary built from CERTIFICATE_FIELDS,
// with live QR code, SHA-256 tamper-evident hash chain block, and prototype disclaimer.

import { NextRequest, NextResponse } from "next/server";
import React from "react";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import QRCode from "qrcode";
import { getServiceSupabase } from "@/lib/supabase";
import { CERTIFICATE_FIELDS, disclaimerText } from "@/data/certificateTemplate";
import type { CertificateData } from "@/lib/types";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1e293b",
  },
  headerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: "#1b4332",
    borderBottomStyle: "solid",
    paddingBottom: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1b4332",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  brandSubtitle: {
    fontSize: 8,
    color: "#475569",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  badgeVerified: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#10b981",
    borderStyle: "solid",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#047857",
  },
  topSummaryBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 6.5,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1b4332",
    marginBottom: 4,
    marginTop: 2,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    paddingBottom: 2,
  },
  fieldsGrid: {
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
    borderBottomStyle: "solid",
    paddingVertical: 3.5,
    alignItems: "center",
  },
  fieldLabelCol: {
    width: "36%",
    paddingRight: 6,
  },
  fieldLabel: {
    fontSize: 7.5,
    color: "#475569",
    fontWeight: "bold",
  },
  fieldValueCol: {
    width: "64%",
  },
  fieldValue: {
    fontSize: 8,
    color: "#0f172a",
  },
  middleSection: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  cryptoBox: {
    flex: 2.2,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    borderRadius: 4,
    padding: 6,
  },
  hashTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 1,
  },
  hashValue: {
    fontFamily: "Courier",
    fontSize: 6,
    color: "#1e293b",
    marginBottom: 4,
    wordBreak: "break-all",
  },
  qrBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    borderRadius: 4,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    width: 68,
    height: 68,
  },
  qrCaption: {
    fontSize: 5.5,
    color: "#64748b",
    marginTop: 2,
    textAlign: "center",
  },
  disclaimerBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderStyle: "solid",
    borderRadius: 4,
    padding: 6,
    marginTop: "auto",
    marginBottom: 6,
  },
  disclaimerHeading: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  disclaimerContent: {
    fontSize: 6,
    color: "#78350f",
    lineHeight: 1.25,
  },
  footer: {
    borderTopWidth: 0.5,
    borderTopColor: "#cbd5e1",
    borderTopStyle: "solid",
    paddingTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 6,
    color: "#94a3b8",
  },
});

function CertificateDocument({
  data,
  qrDataUrl,
}: {
  data: CertificateData;
  qrDataUrl: string;
}) {
  return React.createElement(
    Document,
    {
      title: `HerbTrace-Certificate-${data.batch.id.slice(0, 8)}`,
      author: "RootCode HerbTrace",
    },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.headerContainer },
        React.createElement(
          View,
          { style: styles.headerLeft },
          React.createElement(
            Text,
            { style: styles.brandTitle },
            "Herbal Traceability & Origin Certificate"
          ),
          React.createElement(
            Text,
            { style: styles.brandSubtitle },
            "RootCode HerbTrace — Botanical Chain of Custody (WHO GACP Reference)"
          )
        ),
        React.createElement(
          View,
          { style: styles.badgeVerified },
          React.createElement(
            Text,
            { style: styles.badgeText },
            data.batch.qc_status === "pass"
              ? "QC VERIFIED"
              : `STATUS: ${data.batch.qc_status.toUpperCase()}`
          )
        )
      ),

      // Top Summary Box
      React.createElement(
        View,
        { style: styles.topSummaryBox },
        React.createElement(
          View,
          { style: styles.summaryCol },
          React.createElement(Text, { style: styles.summaryLabel }, "Certificate ID"),
          React.createElement(
            Text,
            { style: styles.summaryValue },
            `CERT-${data.batch.id.slice(0, 8).toUpperCase()}`
          )
        ),
        React.createElement(
          View,
          { style: styles.summaryCol },
          React.createElement(Text, { style: styles.summaryLabel }, "Species Claimed"),
          React.createElement(
            Text,
            { style: styles.summaryValue },
            data.batch.species_claimed
          )
        ),
        React.createElement(
          View,
          { style: styles.summaryCol },
          React.createElement(Text, { style: styles.summaryLabel }, "Collector"),
          React.createElement(
            Text,
            { style: styles.summaryValue },
            data.harvester.name
          )
        ),
        React.createElement(
          View,
          { style: styles.summaryCol },
          React.createElement(Text, { style: styles.summaryLabel }, "Harvest Date"),
          React.createElement(
            Text,
            { style: styles.summaryValue },
            new Date(data.batch.timestamp).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          )
        )
      ),

      // Fields Grid
      React.createElement(
        Text,
        { style: styles.sectionTitle },
        "Botanical & Provenance Specifications"
      ),
      React.createElement(
        View,
        { style: styles.fieldsGrid },
        CERTIFICATE_FIELDS.map((field) =>
          React.createElement(
            View,
            { key: field.key, style: styles.fieldRow },
            React.createElement(
              View,
              { style: styles.fieldLabelCol },
              React.createElement(Text, { style: styles.fieldLabel }, field.label)
            ),
            React.createElement(
              View,
              { style: styles.fieldValueCol },
              React.createElement(
                Text,
                { style: styles.fieldValue },
                field.getValue(data)
              )
            )
          )
        )
      ),

      // Cryptographic Ledger Verification & QR
      React.createElement(
        Text,
        { style: styles.sectionTitle },
        "Tamper-Evident Ledger Commitments & Verification"
      ),
      React.createElement(
        View,
        { style: styles.middleSection },
        React.createElement(
          View,
          { style: styles.cryptoBox },
          React.createElement(
            Text,
            { style: styles.hashTitle },
            "Batch SHA-256 Ledger Hash:"
          ),
          React.createElement(
            Text,
            { style: styles.hashValue },
            data.batch.hash
          ),
          React.createElement(
            Text,
            { style: styles.hashTitle },
            "Previous Link Hash:"
          ),
          React.createElement(
            Text,
            { style: styles.hashValue },
            data.batch.prev_hash ?? "GENESIS_ROOT (Start of Custody Chain)"
          ),
          React.createElement(
            Text,
            { style: styles.hashTitle },
            "Cryptographic Verification:"
          ),
          React.createElement(
            Text,
            { style: { fontSize: 6, color: "#475569", marginTop: 1 } },
            "Canonical JSON payload hashed with SHA-256 into chronological tamper-evident ledger."
          )
        ),
        React.createElement(
          View,
          { style: styles.qrBox },
          qrDataUrl
            ? React.createElement(Image, {
                src: qrDataUrl,
                style: styles.qrImage,
              })
            : null,
          React.createElement(
            Text,
            { style: styles.qrCaption },
            "Scan to verify live batch provenance"
          )
        )
      ),

      // Disclaimer Box
      React.createElement(
        View,
        { style: styles.disclaimerBox },
        React.createElement(
          Text,
          { style: styles.disclaimerHeading },
          "WHO GACP Reference & Compliance Notice"
        ),
        React.createElement(
          Text,
          { style: styles.disclaimerContent },
          disclaimerText
        )
      ),

      // Footer
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(
          Text,
          { style: styles.footerText },
          `RootCode HerbTrace Verification System | Batch: ${data.batch.id}`
        ),
        React.createElement(
          Text,
          { style: styles.footerText },
          `Issued: ${data.generated_at}`
        )
      )
    )
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const batchId = searchParams.get("batchId") || searchParams.get("id");

  if (!batchId) {
    return NextResponse.json(
      { error: "batchId query parameter is required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const supabase = getServiceSupabase();

    // 1. Fetch batch
    const { data: batch, error: batchError } = await supabase
      .from("batches")
      .select("*")
      .eq("id", batchId)
      .maybeSingle();

    if (batchError) {
      return NextResponse.json(
        { error: `Database error: ${batchError.message}` },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    if (!batch) {
      return NextResponse.json(
        { error: `Batch not found for ID: ${batchId}` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // 2. Fetch harvester
    const { data: harvester } = await supabase
      .from("harvesters")
      .select("*")
      .eq("id", batch.harvester_id)
      .maybeSingle();

    const certificateData: CertificateData = {
      batch,
      harvester: harvester ?? {
        id: batch.harvester_id,
        name: "Registered Collector",
        wallet_balance: 0,
      },
      generated_at: new Date().toISOString(),
    };

    // 3. Generate QR code
    const frontendBaseUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL || "https://herbtrace.rootcode.dev";
    const provenanceUrl = `${frontendBaseUrl}/provenance/${batch.id}`;

    const qrDataUrl = await QRCode.toDataURL(provenanceUrl, {
      margin: 1,
      width: 140,
      color: {
        dark: "#1b4332",
        light: "#ffffff",
      },
    });

    // 4. Render PDF buffer
    const pdfBuffer = await pdf(
      React.createElement(CertificateDocument, {
        data: certificateData,
        qrDataUrl,
      })
    ).toBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="HerbTrace-Certificate-${batch.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate certificate PDF";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

