import { NextResponse } from "next/server";
import { contactSchema } from "@/schemas";
import { sendContactEmail } from "@/lib/email";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Please check the contact form and try again." }, { status: 400 });
  }

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ message: "Message sent." });
  } catch {
    return NextResponse.json(
      { message: "The message could not be sent right now. Please try again later." },
      { status: 500 },
    );
  }
}
