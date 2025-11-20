"use client";

import { redirect } from "next/navigation";

export default function ProductPage() {
  // Redirection vers le premier produit par défaut
  redirect("/product/amundi-cac40");
}
