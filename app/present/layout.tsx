import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Presentation Display | TACN IJU",
  description: "Live display for projector",
};

export default function PresentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black min-h-screen">
      {children}
    </div>
  );
}
