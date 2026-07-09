import { redirect } from "next/navigation";

// The chat hero on the homepage IS the generator now.
export default function GeneratePage() {
  redirect("/");
}
