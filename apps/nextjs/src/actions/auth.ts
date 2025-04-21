"use server";

import { redirect } from "next/navigation";

import { auth } from "@acme/auth";

export async function signIn(formData: FormData) {
	console.log(formData);
  const res = await auth.api.signInSocial({
    body: {
      provider: "discord",
      callbackURL: "/",
    },
  });
	if (res.url) redirect(res.url);
	else throw new Error("Failed to login");
  // ...
}
